// ==========================================================================
// GIANDECO — PAGOS EN LÍNEA   (Supabase Edge Function · Deno)
//
// Único punto que habla con la pasarela (Culqi) y único que marca un pedido
// como pagado. La web nunca decide cuánto se cobra: el monto se recalcula
// aquí con los precios del catálogo y los ajustes del estudio.
//
// Acciones (POST, JSON):
//   { accion:'estado' }                          ¿hay pasarela configurada?
//   { accion:'consulta', n, cel }                cuánto se debe por un pedido
//   { accion:'cobrar', n, cel, token, device?, auth3ds?, cuotas? }
//
// Secretos de la función (Supabase → Edge Functions → Secrets):
//   CULQI_PK   llave pública   pk_test_… / pk_live_…
//   CULQI_SK   llave privada   sk_test_… / sk_live_…   (nunca en el repositorio)
// Sin ellos la función responde "sin pasarela" y la tienda sigue como antes.
// Pasar de pruebas a producción es cambiar esos dos secretos: no se toca código.
//
// Se despliega con la verificación de JWT desactivada: la tienda es pública y
// quien llama se identifica con número de pedido y celular.
// ==========================================================================

const SB_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SB_KEY = Deno.env.get('SB_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const PK = (Deno.env.get('CULQI_PK') ?? '').trim();
const SK = (Deno.env.get('CULQI_SK') ?? '').trim();
const CATALOGO = Deno.env.get('CATALOGO_URL') ?? 'https://giandeco.com/js/giandeco.js';
const ACTIVA = /^pk_(test|live)_/.test(PK) && /^sk_(test|live)_/.test(SK) && PK.slice(3, 7) === SK.slice(3, 7);
const PRUEBA = PK.startsWith('pk_test_');

const ORIGENES = [/^https:\/\/(www\.)?giandeco\.com$/, /^https:\/\/yedi06\.github\.io$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const MIN = 300, MAX = 999900, MAX_YAPE = 200000;   // céntimos
const INTENTOS = 8;                                  // cobros fallidos tolerados por pedido

type J = Record<string, any>;

// ---------- base de datos (PostgREST con la clave de servicio) ----------
function bd(ruta: string, init: RequestInit = {}) {
  return fetch(SB_URL + '/rest/v1/' + ruta, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}
async function leerPedido(n: string, cel: string): Promise<J | null> {
  const r = await bd('pedidos?select=datos&id=eq.' + encodeURIComponent(n));
  if (!r.ok) throw new Error('pedidos ' + r.status);
  const f = await r.json();
  const d = f[0]?.datos;
  return d && d.cliente?.cel === cel ? d : null;
}
async function leerAjustes(): Promise<{ cfg: J; prod: J }> {
  const r = await bd('config?select=clave,valor&clave=in.(config,prod)');
  const out = { cfg: {} as J, prod: {} as J };
  if (r.ok) for (const f of await r.json()) { if (f.clave === 'config') out.cfg = f.valor ?? {}; else out.prod = f.valor ?? {}; }
  return out;
}

// ---------- precios: los del catálogo publicado más lo que fijó el panel ----------
let cache: { t: number; base: Record<string, number | null> } | null = null;
function soles(txt: unknown): number | null {
  const n = parseFloat(String(txt).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}
async function precios(prod: J): Promise<Record<string, number | null>> {
  if (!cache || Date.now() - cache.t > 5 * 60_000) {
    const r = await fetch(CATALOGO, { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) throw new Error('catálogo ' + r.status);
    const js = await r.text(), base: Record<string, number | null> = {};
    const re = /'([a-z0-9-]+)'\s*:\s*\{\s*nombre:'(?:[^'\\]|\\.)*',\s*cat:'(?:[^'\\]|\\.)*',\s*precio:'([^']*)'/g;
    for (let m; (m = re.exec(js));) base[m[1]] = soles(m[2]);
    if (!Object.keys(base).length) throw new Error('catálogo vacío');
    cache = { t: Date.now(), base };
  }
  const p = { ...cache.base };
  for (const [k, n] of Object.entries<J>(prod.nuevos ?? {})) if (!(k in p)) p[k] = soles(n?.precio);
  for (const [k, o] of Object.entries<J>(prod.over ?? {})) {
    if (!(k in p)) continue;
    if (o?.activo === false) { delete p[k]; continue; }
    if (o?.precio != null && Number.isFinite(Number(o.precio)) && Number(o.precio) > 0) p[k] = Number(o.precio);
  }
  return p;
}

// ---------- cuánto se debe ----------
const num = (x: unknown) => (x === null || x === undefined || x === '' || !Number.isFinite(Number(x)) ? null : Number(x));
const cent = (s: number) => Math.round(s * 100);

async function cuenta(d: J) {
  const items = (Array.isArray(d.items) ? d.items : []).map((x: J) => ({ nombre: String(x.nombre ?? ''), qty: Math.max(1, Math.min(99, parseInt(x.qty) || 1)), key: x.key as string | undefined }));
  const vista: J[] = items.map((x: J) => ({ nombre: x.nombre, qty: x.qty, key: x.key ?? '' }));
  const base = { pagado: d.pagado === true, recojo: d.entrega?.tipo === 'recojo', items: vista };
  const no = (motivo: string) => ({ ...base, pagable: false, motivo, monto: 0, desglose: null });
  if (base.pagado) return no('pagado');
  if (d.demo || d.estado === 5) return no('cerrado');
  if (!items.length) return no('cotizar');

  const { cfg, prod } = await leerAjustes();
  const P = await precios(prod);
  let subtotal = 0;
  for (const x of items) {
    const p = x.key ? P[x.key] : null;
    if (p == null) return no('cotizar');                     // pieza a cotizar o que ya no está a la venta
    subtotal += p * x.qty;
    vista[items.indexOf(x)].importe = cent(p * x.qty);
  }
  const c = d.cupon ? cfg.CUPONES?.[String(d.cupon).toUpperCase()] : null;
  const descuento = c ? Math.min(subtotal, c.pct ? subtotal * Number(c.pct) / 100 : Number(c.monto) || 0) : 0;

  let envio: number | null = 0;
  if (d.entrega?.tipo !== 'recojo') envio = num(d.envio) ?? num(cfg.ENVIO?.[d.entrega?.zona]);
  if (envio === null) return no('envio');                    // el estudio aún no confirmó el envío
  const armado = d.entrega?.armado ? num(d.armadoMonto) : 0;
  if (armado === null) return no('armado');

  const desglose = { subtotal: cent(subtotal), descuento: cent(descuento), envio: cent(envio), armado: cent(armado) };
  const monto = desglose.subtotal - desglose.descuento + desglose.envio + desglose.armado;
  if (monto < MIN || monto > MAX) return { ...base, pagable: false, motivo: 'monto', monto, desglose };
  return { ...base, pagable: true, motivo: '', monto, desglose };
}

// ---------- pasarela ----------
async function cargoCulqi(cuerpo: J): Promise<{ http: number; j: J }> {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 45_000);
  try {
    const r = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST', signal: ctl.signal,
      headers: { Authorization: 'Bearer ' + SK, 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    return { http: r.status, j: await r.json().catch(() => ({})) };
  } finally { clearTimeout(t); }
}
const marcar = (id: string, cambios: J) =>
  bd('pagos?id=eq.' + id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...cambios, actualizado: new Date().toISOString() }) });

async function cobrar(q: J) {
  const token = String(q.token ?? '');
  const tk = /^(tkn|ype)_(test|live)_[A-Za-z0-9]+$/.exec(token);
  if (!tk || (tk[2] === 'test') !== PRUEBA) return { ok: false, mensaje: 'No se pudo leer el medio de pago. Inténtelo de nuevo.' };
  const medio = tk[1] === 'ype' ? 'yape' : 'tarjeta';

  const d = await leerPedido(q.n, q.cel);
  if (!d) return { ok: false, motivo: 'no-encontrado' };
  const c = await cuenta(d);
  if (c.pagado) return { ok: true, pagado: true };
  if (!c.pagable) return { ok: false, motivo: c.motivo };
  if (medio === 'yape' && c.monto > MAX_YAPE) return { ok: false, mensaje: 'Yape admite pagos de hasta S/ 2,000. Pague con tarjeta o coordine con el estudio.' };

  const prev = await bd('pagos?select=estado&pedido=eq.' + encodeURIComponent(q.n));
  const antes: J[] = prev.ok ? await prev.json() : [];
  if (antes.filter((p) => p.estado === 'rechazado').length >= INTENTOS)
    return { ok: false, mensaje: 'Se alcanzó el máximo de intentos para este pedido. Escriba al estudio para completar el pago.' };

  // el índice único de la tabla impide dos cobros vivos del mismo pedido
  const alta = await bd('pagos', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ pedido: q.n, estado: 'procesando', monto: c.monto, medio }) });
  if (alta.status === 409) return { ok: false, motivo: 'en-curso' };
  if (!alta.ok) throw new Error('pagos ' + alta.status);
  const id = (await alta.json())[0].id as string;

  const nombre = String(d.cliente?.nombre ?? '').trim().split(/\s+/);
  const cuerpo: J = {
    amount: c.monto, currency_code: 'PEN', email: String(d.cliente?.email ?? ''), source_id: token,
    description: 'Pedido ' + q.n + ' · Giandeco',
    metadata: { pedido: q.n },
    antifraud_details: {
      first_name: nombre[0] ?? '', last_name: nombre.slice(1).join(' ') || (nombre[0] ?? ''),
      phone_number: String(d.cliente?.cel ?? ''), country_code: 'PE',
      ...(d.entrega?.dir ? { address: String(d.entrega.dir).slice(0, 100), address_city: String(d.entrega.distrito ?? 'Lima').slice(0, 30) } : {}),
      ...(/^[0-9a-f-]{36}$/i.test(String(q.device ?? '')) ? { device_finger_print_id: q.device } : {}),
    },
  };
  const cuotas = parseInt(q.cuotas);
  if (medio === 'tarjeta' && cuotas >= 2 && cuotas <= 48) cuerpo.installments = cuotas;
  const a = q.auth3ds;
  if (medio === 'tarjeta' && a && typeof a === 'object') {
    cuerpo.authentication_3DS = Object.fromEntries(['eci', 'xid', 'cavv', 'protocolVersion', 'directoryServerTransactionId']
      .filter((k) => typeof a[k] === 'string' && a[k].length < 200).map((k) => [k, a[k]]));
  }

  let res: { http: number; j: J };
  try { res = await cargoCulqi(cuerpo); }
  catch (_e) {
    // sin respuesta: no se sabe si se cobró. El pedido queda bloqueado hasta que el estudio lo revise.
    await marcar(id, { estado: 'incierto', detalle: { error: 'sin respuesta de la pasarela' } });
    return { ok: false, motivo: 'incierto' };
  }
  const j = res.j;

  if (j.object === 'charge' && j.id) {
    const src = j.source ?? {}, iin = src.iin ?? {};
    const pago = {
      proveedor: 'culqi', cargo: j.id, monto: c.monto, medio, fecha: new Date().toISOString(),
      ref: j.reference_code ?? '', marca: iin.card_brand ?? (medio === 'yape' ? 'Yape' : ''), ultimos4: src.last_four ?? '',
      cuotas: j.installments || 0, prueba: PRUEBA,
    };
    await marcar(id, { estado: 'pagado', cargo: j.id, detalle: pago });
    for (let i = 0; i < 3; i++) {
      const r = await bd('rpc/marcar_pagado', { method: 'POST', body: JSON.stringify({ p_n: q.n, p_pago: pago }) });
      if (r.ok) break;
    }
    return { ok: true, pagado: true, ref: pago.ref, medio, marca: pago.marca, ultimos4: pago.ultimos4, monto: c.monto };
  }
  if (j.action_code === 'REVIEW') {
    await marcar(id, { estado: '3ds', detalle: { http: res.http } });
    return { ok: false, requiere3ds: true, monto: c.monto, email: cuerpo.email };
  }
  if (res.http >= 500 || !j.object) {
    await marcar(id, { estado: 'incierto', detalle: { http: res.http } });
    return { ok: false, motivo: 'incierto' };
  }
  await marcar(id, { estado: 'rechazado', detalle: { http: res.http, tipo: j.type ?? '', codigo: j.code ?? j.decline_code ?? '', comercio: j.merchant_message ?? '' } });
  return { ok: false, mensaje: j.user_message || 'El pago no se pudo completar. Revise los datos o pruebe con otro medio de pago.' };
}

// ---------- entrada ----------
Deno.serve(async (req) => {
  const origen = req.headers.get('origin') ?? '';
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': ORIGENES.some((o) => o.test(origen)) ? origen : 'https://giandeco.com',
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin',
  };
  const out = (cuerpo: J, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return out({ ok: false }, 405);

  let q: J;
  try { q = await req.json(); } catch (_e) { return out({ ok: false }, 400); }
  try {
    if (q.accion === 'estado') return out({ ok: true, activa: ACTIVA, prueba: ACTIVA && PRUEBA });
    if (!/^GD-\d{6}-\d{4}$/.test(String(q.n ?? '')) || !/^9\d{8}$/.test(String(q.cel ?? ''))) return out({ ok: false, motivo: 'no-encontrado' });

    if (q.accion === 'consulta') {
      const d = await leerPedido(q.n, q.cel);
      if (!d) return out({ ok: false, motivo: 'no-encontrado' });
      const c = await cuenta(d);
      const activa = ACTIVA && c.pagable;
      return out({
        ok: true, ...c, pagable: activa, motivo: c.pagable && !ACTIVA ? 'sin-pasarela' : c.motivo,
        pk: activa ? PK : '', prueba: ACTIVA && PRUEBA, yape: c.monto <= MAX_YAPE,
        pago: c.pagado ? (d.pagoOnline ? { ref: d.pagoOnline.ref, medio: d.pagoOnline.medio, marca: d.pagoOnline.marca, ultimos4: d.pagoOnline.ultimos4 } : {}) : null,
        cliente: { nombre: String(d.cliente?.nombre ?? '').split(/\s+/)[0], email: d.cliente?.email ?? '' },
      });
    }
    if (q.accion === 'cobrar') {
      if (!ACTIVA) return out({ ok: false, motivo: 'sin-pasarela' });
      return out(await cobrar(q));
    }
    return out({ ok: false }, 400);
  } catch (e) {
    console.error('pago', q?.accion, q?.n, e);
    return out({ ok: false, motivo: 'error' });
  }
});
