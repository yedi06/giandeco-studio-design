/* ==========================================================================
   GIANDECO — MI CUENTA
   Acceso (correo y clave, Google, recuperar clave) y panel del cliente:
   resumen, pedidos, proyectos, guardados y datos. Pocas palabras: el estado
   se entiende por iconos, cifras y barras de avance.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA, A = window.GD_AUTH;
if(!T || !A) return;
var esc = T.esc, root = document.getElementById('cu');

/* ---------- iconos (trazo fino, como el resto del sitio) ---------- */
function svg(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
var I = {
  resumen:  svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
  pedidos:  svg('<path d="M5 7.5h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 9.5V6.8a3 3 0 0 1 6 0v2.7"/>'),
  proyectos:svg('<path d="M4 20V9l8-5 8 5v11"/><path d="M9.5 20v-6h5v6"/>'),
  favoritos:svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  datos:    svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  salir:    svg('<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16l-4-4 4-4M6 12h10"/>'),
  ojo:      svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
  ojoNo:    svg('<path d="M3 3l18 18"/><path d="M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.6 6.7C4 8.4 2.5 12 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 4.1-.9"/><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4"/>'),
  escudo:   svg('<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>'),
  wa:       svg('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z"/><path d="M9.2 8.6c.2-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.5-.2.7-.1l1.5.7c.2.1.4.3.4.5v.5c0 .4-.1.7-.5.9-1.6.9-4.2-.5-5.6-1.9s-2.8-4-1.9-5.4z"/>'),
  repetir:  svg('<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20v-4.5h4.5"/>'),
  tarjeta:  svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  correo:   svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>')
};
var GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function fecha(iso){ return new Date(iso).toLocaleDateString('es-PE', { day:'numeric', month:'short', year:'numeric' }); }
function correoOk(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
/* fuerza de la clave: 0 a 4 */
function fuerza(c){ var n = 0; if(c.length >= 8) n++; if(c.length >= 12) n++; if(/[a-zA-Z]/.test(c) && /\d/.test(c)) n++; if(/[^a-zA-Z0-9]/.test(c) || /[a-z]/.test(c) && /[A-Z]/.test(c)) n++; return n; }

/* ==================== ACCESO ==================== */
var vista = 'entrar', aviso = null;
function f(id, label, tipo, extra){
  return '<label class="cx-f' + (tipo === 'password' ? ' es-clave' : '') + '"><input id="' + id + '" type="' + tipo + '" placeholder=" " ' + (extra || '') + '><span>' + label + '</span>' +
    (tipo === 'password' ? '<button type="button" class="cx-ojo" data-ojo="' + id + '" aria-label="Mostrar la clave">' + I.ojo + '</button>' : '') + '</label>';
}
function tarjeta(){
  var cab = vista === 'entrar' || vista === 'crear'
    ? '<div class="cx-seg" role="tablist" aria-label="Acceso"><button type="button" role="tab" data-v="entrar" aria-selected="' + (vista === 'entrar') + '">Iniciar sesión</button>' +
      '<button type="button" role="tab" data-v="crear" aria-selected="' + (vista === 'crear') + '">Crear cuenta</button><i class="cx-seg-luz" aria-hidden="true"></i></div>' +
      '<button type="button" class="cx-google" id="cxGoogle">' + GOOGLE + '<span>Continuar con Google</span></button>' +
      '<div class="cx-o"><span>o con su correo</span></div>'
    : '';
  var cuerpo = {
    entrar: f('cxCorreo', 'Correo', 'email', 'autocomplete="email" required') + f('cxClave', 'Clave', 'password', 'autocomplete="current-password" required') +
      '<button type="button" class="cx-link" data-v="olvido">¿Olvidó su clave?</button>',
    crear: f('cxNombre', 'Nombre y apellido', 'text', 'autocomplete="name" required') + f('cxCorreo', 'Correo', 'email', 'autocomplete="email" required') +
      f('cxClave', 'Clave · mínimo 8 caracteres', 'password', 'autocomplete="new-password" minlength="8" required') +
      '<div class="cx-fuerza" aria-hidden="true"><i></i><i></i><i></i><i></i></div>',
    olvido: '<p class="cx-sub">Le enviamos un enlace para crear una nueva.</p>' + f('cxCorreo', 'Correo', 'email', 'autocomplete="email" required'),
    nueva: f('cxClave', 'Nueva clave · mínimo 8', 'password', 'autocomplete="new-password" minlength="8" required') +
      '<div class="cx-fuerza" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' + f('cxClave2', 'Repita la clave', 'password', 'autocomplete="new-password" required'),
    enviado: ''
  }[vista];
  var boton = { entrar:'Entrar', crear:'Crear cuenta', olvido:'Enviar enlace', nueva:'Guardar clave' }[vista];
  if(vista === 'enviado'){
    return '<div class="cx-enviado"><span class="cx-enviado-ico">' + I.correo + '</span><p class="cx-sub">' + esc(aviso || '') + '</p>' +
      '<button type="button" class="cx-btn" data-v="entrar"><span>Volver a iniciar sesión</span></button></div>';
  }
  return cab + '<form class="cx-form" id="cxForm" novalidate>' + cuerpo +
    '<p class="cx-msg" id="cxMsg" role="alert"' + (aviso ? '' : ' hidden') + '>' + esc(aviso || '') + '</p>' +
    '<button type="submit" class="cx-btn"><span>' + boton + '</span><i class="cx-giro" aria-hidden="true"></i></button></form>' +
    (vista === 'crear' ? '<p class="cx-legal">Al crear su cuenta acepta los <a href="terminos-y-condiciones">términos</a> y la <a href="politica-de-privacidad">privacidad</a>.</p>' : '');
}
/* la lámina de acceso: monograma, título, cota de plano y el formulario, centrados */
var TITULO = { entrar:'Bienvenido', crear:'Cree su cuenta', olvido:'Recuperar clave', nueva:'Nueva clave', enviado:'Revise su correo' };
function acceso(){
  document.getElementById('cx').classList.remove('es-panel');
  root.innerHTML = '<div class="cx-auth"><div class="cx-card" id="cxCard" data-vista="' + vista + '">' +
    '<img class="cx-logo" src="img/logo-dorado.svg" width="300" height="268" alt="Giandeco Studio Design">' +
    '<p class="cx-rotulo">Mi cuenta</p><h1 class="cx-titulo">' + TITULO[vista] + '</h1>' +
    (vista === 'olvido' || vista === 'nueva' || vista === 'enviado' ? '' : '') +
    tarjeta() +
    (vista === 'olvido' || vista === 'nueva' ? '<button type="button" class="cx-atras" data-v="entrar">← Volver a iniciar sesión</button>' : '') +
    '</div></div>';
  aviso = null;
}
function irA(v, msg){ vista = v; aviso = msg || null; acceso(); var x = root.querySelector('.cx-card input'); if(x) x.focus({ preventScroll:true }); }
function error(msg){ var m = document.getElementById('cxMsg'); if(m){ m.hidden = false; m.textContent = msg; m.classList.remove('es-ok'); } }
function ocupado(on){ var b = root.querySelector('.cx-btn'); if(b){ b.disabled = on; b.classList.toggle('is-cargando', on); } }
function marcar(id, ok){ var el = document.getElementById(id); if(el) el.closest('.cx-f').classList.toggle('is-mal', !ok); return ok; }

function enviarAcceso(){
  var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var correo = g('cxCorreo'), clave = (document.getElementById('cxClave') || {}).value || '';
  if(vista === 'entrar'){
    if(![marcar('cxCorreo', correoOk(correo)), marcar('cxClave', clave.length > 0)].every(Boolean)) return error('Revise el correo y la clave.');
    ocupado(true);
    A.entrar(correo, clave).then(function(r){ ocupado(false); if(r.ok){ pintar(); window.scrollTo(0, 0); } else error(r.error); });
  } else if(vista === 'crear'){
    var nombre = g('cxNombre');
    if(![marcar('cxNombre', nombre.split(/\s+/).length >= 2), marcar('cxCorreo', correoOk(correo)), marcar('cxClave', clave.length >= 8 && fuerza(clave) >= 2)].every(Boolean))
      return error(nombre.split(/\s+/).length < 2 ? 'Escriba nombre y apellido.' : !correoOk(correo) ? 'Revise el correo.' : 'Use al menos 8 caracteres, con letras y números.');
    ocupado(true);
    A.registrar(nombre, correo, clave).then(function(r){
      ocupado(false);
      if(!r.ok) return error(r.error);
      if(r.confirmar) return irA('enviado', 'Le enviamos un enlace a ' + correo + ' para activar su cuenta.');
      pintar(); window.scrollTo(0, 0);
    });
  } else if(vista === 'olvido'){
    if(!marcar('cxCorreo', correoOk(correo))) return error('Revise el correo.');
    ocupado(true);
    A.recuperar(correo).then(function(r){ ocupado(false); if(r.ok) irA('enviado', 'Si ' + correo + ' tiene cuenta, le llegará un enlace para crear una nueva clave.'); else error(r.error); });
  } else if(vista === 'nueva'){
    var c2 = (document.getElementById('cxClave2') || {}).value || '';
    if(!marcar('cxClave', clave.length >= 8 && fuerza(clave) >= 2)) return error('Use al menos 8 caracteres, con letras y números.');
    if(!marcar('cxClave2', c2 === clave)) return error('Las claves no coinciden.');
    ocupado(true);
    A.nuevaClave(clave).then(function(r){ ocupado(false); if(r.ok){ vista = 'entrar'; pintar('Clave actualizada.'); } else error(r.error); });
  }
}

/* ==================== PANEL ==================== */
var TABS = [['resumen', 'Resumen'], ['pedidos', 'Pedidos'], ['proyectos', 'Proyectos'], ['favoritos', 'Guardados'], ['datos', 'Mis datos']];
var ETAPAS = ['Visita y metrado', 'Propuesta y render', 'Mobiliario y compras', 'Montaje'];

function avance(p){
  var n = T.ESTADOS.length - 1, pct = Math.round(Math.min(p.estado, n) / n * 100);
  return '<div class="cx-avance" role="img" aria-label="Estado: ' + esc(T.ESTADOS[p.estado]) + '"><div class="cx-avance-barra"><i style="width:' + Math.max(pct, 4) + '%"></i></div>' +
    '<ol>' + T.ESTADOS.map(function(e, i){ return '<li class="' + (i < p.estado ? 'is-hecho' : i === p.estado ? 'is-ahora' : '') + '"><span>' + e + '</span></li>'; }).join('') + '</ol></div>';
}
function pedidoHTML(p, compacto){
  var fotos = p.items.slice(0, 4).map(function(x){ var c = x.key && T.CAT[x.key]; return c && c.img ? '<img src="' + esc(c.img) + '" alt="" loading="lazy" decoding="async">' : '<b>G</b>'; }).join('');
  return '<article class="cx-ped">' +
    '<header><div class="cx-ped-fotos">' + fotos + (p.items.length > 4 ? '<em>+' + (p.items.length - 4) + '</em>' : '') + '</div>' +
      '<div class="cx-ped-id"><b>' + esc(p.n) + '</b><span>' + fecha(p.fecha) + ' · ' + p.items.reduce(function(a, x){ return a + x.qty; }, 0) + ' pzs.</span></div>' +
      '<strong>' + (p.subtotal ? T.fmt(p.subtotal) : 'Cotización') + '</strong></header>' +
    avance(p) +
    (compacto ? '' : '<ul class="cx-ped-items">' + p.items.map(function(x){
        var op = x.key && p.estado >= T.ESTADOS.length - 1 ? (T.opiniones.mia(x.key) ? '<small>Opinión en revisión</small>' : '<a class="cx-mini" href="' + T.url(x.key) + '#opiniones">Opinar</a>') : '';
        return '<li><span>' + x.qty + '×</span>' + (x.key ? '<a href="' + T.url(x.key) + '">' + esc(x.nombre) + '</a>' : esc(x.nombre)) + '<em>' + (x.valor === null ? 'A cotizar' : T.fmt(x.valor * x.qty)) + '</em>' + op + '</li>';
      }).join('') + '</ul>') +
    '<div class="cx-ped-acc">' +
      (p.subtotal && !p.pagado && T.db('pasarela') === true ? '<a class="cx-chip es-oro" href="pagar?n=' + encodeURIComponent(p.n) + '">' + I.tarjeta + 'Pagar</a>' : '') +
      (p.pagoKey === 'directo' && !p.pagado ? '<a class="cx-chip es-oro" href="checkout?ok=' + encodeURIComponent(p.n) + '">' + I.tarjeta + 'Datos de pago</a>' : '') +
      (p.pagado ? '<span class="cx-chip es-ok">' + I.escudo + 'Pagado</span>' : '') +
      '<a class="cx-chip" href="' + T.wa('Hola Giandeco, quiero saber el estado de mi pedido ' + p.n + '.') + '" target="_blank" rel="noopener">' + I.wa + 'Consultar</a>' +
      '<button type="button" class="cx-chip" data-repetir="' + esc(p.n) + '">' + I.repetir + 'Repetir</button>' +
    '</div></article>';
}
function vacio(icono, texto, href, cta){
  return '<div class="cx-vacio"><span>' + icono + '</span><p>' + texto + '</p>' + (href ? '<a class="cx-btn es-chico" href="' + href + '"><span>' + cta + '</span></a>' : '') + '</div>';
}

var PANEL = {
  resumen: function(){
    var ped = T.pedidos.lista(), fav = T.favs.lista().filter(function(k){ return T.CAT[k]; }), vis = T.vistos.lista().slice(0, 4);
    return '<div class="cx-kpis">' +
        '<a class="cx-kpi" href="#pedidos">' + I.pedidos + '<b>' + ped.length + '</b><span>Pedidos</span></a>' +
        '<a class="cx-kpi" href="#favoritos">' + I.favoritos + '<b>' + fav.length + '</b><span>Guardados</span></a>' +
        '<a class="cx-kpi" href="#proyectos">' + I.proyectos + '<b>0</b><span>Proyectos</span></a></div>' +
      '<h2 class="cx-h">Último pedido</h2>' + (ped.length ? pedidoHTML(ped[0], true) : vacio(I.pedidos, 'Aún no hay pedidos.', 'catalogo', 'Ver el catálogo')) +
      (vis.length ? '<h2 class="cx-h">Vistas hace poco</h2><div class="gd-grid es-carrusel">' + vis.map(function(k){ return T.card(k); }).join('') + '</div>' : '');
  },
  pedidos: function(){
    var ped = T.pedidos.lista();
    return ped.length ? ped.map(function(p){ return pedidoHTML(p); }).join('') : vacio(I.pedidos, 'Aún no hay pedidos.', 'catalogo', 'Ver el catálogo');
  },
  proyectos: function(s){
    var n = ''; for(var i = 0; i <= 10; i++) n += '<input type="radio" name="tsNps" id="tsNps' + i + '" value="' + i + '"><label for="tsNps' + i + '">' + i + '</label>';
    return '<ol class="cx-etapas">' + ETAPAS.map(function(e, i){ return '<li><i>' + (i + 1) + '</i><span>' + e + '</span></li>'; }).join('') + '</ol>' +
      vacio(I.proyectos, 'Sin proyecto vinculado.', null) +
      '<div class="cx-acc"><a class="cx-btn es-chico" href="' + T.wa('Hola Giandeco, soy ' + s.nombre + ' y quiero vincular mi proyecto a mi cuenta (' + s.email + ').') + '" target="_blank" rel="noopener"><span>Vincular mi proyecto</span></a>' +
        '<a class="cx-chip" href="contacto">Agendar visita técnica</a></div>' +
      '<details class="cx-plegable"><summary>Dejar mi testimonio</summary>' +
        '<form class="gd-form" id="tsForm" novalidate>' +
          '<div class="gd-form gd-form-2">' + campo('tsProy', 'Proyecto', 'type="text"', 'Indique qué proyecto fue.') + campo('tsRol', 'Cargo y empresa (opcional)', 'type="text"', '') + '</div>' +
          '<div class="gd-field"><label for="tsAntes">¿Qué necesitaba resolver?</label><textarea id="tsAntes" style="min-height:84px;"></textarea><span class="gdt-err">Una o dos líneas.</span></div>' +
          '<div class="gd-field"><label for="tsDespues">¿Qué cambió después?</label><textarea id="tsDespues" style="min-height:84px;"></textarea><span class="gdt-err">Una o dos líneas.</span></div>' +
          '<div class="gd-field"><label>¿Nos recomendaría? 0 a 10</label><div class="cu-nps op-nota">' + n + '</div><span class="gdt-err">Elija un número.</span></div>' +
          '<label class="gdt-check"><input type="checkbox" id="tsPub"><span>Autorizo publicarlo con mi nombre y mi marca.</span></label>' +
          '<button type="submit" class="cx-btn es-chico"><span>Enviar por WhatsApp</span></button></form></details>';
  },
  favoritos: function(){
    var fav = T.favs.lista().filter(function(k){ return T.CAT[k]; });
    return fav.length ? '<div class="gd-grid">' + fav.map(function(k){ return T.card(k); }).join('') + '</div>' : vacio(I.favoritos, 'Aún no guarda piezas.', 'catalogo', 'Ver el catálogo');
  },
  datos: function(s){
    var d = T.db('datos') || {}, conCuenta = !!A.actual();
    return '<form class="gd-form cx-datos" id="cuDatos" novalidate>' +
        campo('cuNombre', 'Nombre y apellido', 'type="text" autocomplete="name"', 'Indique su nombre.', s.nombre) +
        '<div class="gd-form gd-form-2">' + campo('cuCel', 'Celular', 'type="tel" inputmode="numeric" maxlength="9" autocomplete="tel-national"', 'Celular de 9 dígitos que empiece en 9.', s.cel) +
          campo('cuEmail', 'Correo', 'type="email" autocomplete="email"' + (conCuenta ? ' readonly' : ''), 'Revise el correo.', s.email) + '</div>' +
        '<div class="cx-acc"><button type="submit" class="cx-btn es-chico"><span>Guardar</span></button><span class="cx-ok" id="cuOk" role="status" hidden>Guardado</span></div></form>' +
      '<div class="cx-fichas">' +
        '<div class="cx-ficha"><span>Entrega</span><b>' + (d.dir ? esc(d.dir) : '—') + '</b></div>' +
        '<div class="cx-ficha"><span>Comprobante</span><b>' + (d.comp === 'factura' ? 'Factura · RUC ' + esc(d.ruc) : d.doc ? 'Boleta · ' + esc(d.tdoc) + ' ' + esc(d.doc) : '—') + '</b></div>' +
        '<div class="cx-ficha"><span>Acceso</span><b>' + (conCuenta ? (s.proveedor === 'google' ? 'Google' : 'Correo y clave') : 'Solo este dispositivo') + '</b></div>' +
      '</div>' +
      '<div class="cx-acc">' + (conCuenta && s.proveedor !== 'google' ? '<button type="button" class="cx-chip" id="cuClave">Cambiar clave</button>' : '') +
        '<button type="button" class="cx-chip" id="cuSalir">' + I.salir + 'Cerrar sesión</button>' +
        '<button type="button" class="cx-chip es-peligro" id="cuBorrar">Borrar datos de este dispositivo</button></div>';
  }
};
function campo(id, label, attrs, err, val){
  return '<div class="gd-field"><label for="' + id + '">' + label + '</label><input id="' + id + '" ' + attrs + ' value="' + esc(val || '') + '"><span class="gdt-err">' + err + '</span></div>';
}
function iniciales(n){ return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function(x){ return x[0]; }).join('').toUpperCase() || 'G'; }

function panel(s, nota){
  document.getElementById('cx').classList.add('es-panel');
  var tab = (location.hash || '').slice(1); if(!PANEL[tab]) tab = 'resumen';
  var cuenta = { pedidos:T.pedidos.lista().length, favoritos:T.favs.lista().filter(function(k){ return T.CAT[k]; }).length };
  var conCuenta = !!A.actual();
  root.innerHTML =
    '<header class="cx-perfil">' +
      '<span class="cx-avatar">' + (s.foto ? '<img src="' + esc(s.foto) + '" alt="" referrerpolicy="no-referrer">' : iniciales(s.nombre)) + '</span>' +
      '<div><p class="gd-eyebrow">Mi cuenta</p><h1>Hola, ' + esc(String(s.nombre).split(' ')[0]) + '</h1><span class="cx-correo">' + esc(s.email || '') +
        (conCuenta ? '<em class="cx-sello">' + I.escudo + (s.proveedor === 'google' ? 'Google' : 'Verificada') + '</em>' : '') + '</span></div>' +
      '<button type="button" class="cx-salir" id="cuSalir2" aria-label="Cerrar sesión">' + I.salir + '</button>' +
    '</header>' +
    (nota ? '<p class="cx-nota" role="status">' + esc(nota) + '</p>' : '') +
    (conCuenta ? '' : '<div class="cx-asegurar"><span>' + I.escudo + '</span><div><b>Proteja su cuenta</b><small>Hoy vive solo en este dispositivo.</small></div>' +
      '<button type="button" class="cx-google es-chico" id="cxGoogle">' + GOOGLE + '<span>Google</span></button><button type="button" class="cx-chip" data-crear>Crear clave</button></div>') +
    '<nav class="cx-tabs" aria-label="Secciones de la cuenta">' + TABS.map(function(t){
      return '<a href="#' + t[0] + '"' + (t[0] === tab ? ' class="is-activo" aria-current="page"' : '') + '>' + I[t[0]] + '<span>' + t[1] + '</span>' + (cuenta[t[0]] ? '<i>' + cuenta[t[0]] + '</i>' : '') + '</a>';
    }).join('') + '</nav>' +
    '<section class="cx-panel" data-tab="' + tab + '">' + PANEL[tab](s) + '</section>';
}

function pintar(nota){
  var s = T.sesion.get();
  if(s) panel(s, nota); else acceso();
}

/* ---------- eventos ---------- */
root.addEventListener('click', function(e){
  var t = e.target;
  var v = t.closest('[data-v]'); if(v){ e.preventDefault(); irA(v.getAttribute('data-v')); return; }
  if(t.closest('#cxGoogle')){
    var gb = t.closest('#cxGoogle'); gb.disabled = true;
    A.google().then(function(r){ gb.disabled = false; if(r && !r.ok){ if(document.getElementById('cxMsg')) error(r.error); else pintar(r.error); } });
    return;
  }
  var ojo = t.closest('[data-ojo]');
  if(ojo){ var inp = document.getElementById(ojo.getAttribute('data-ojo')), ver = inp.type === 'password'; inp.type = ver ? 'text' : 'password';
    ojo.innerHTML = ver ? I.ojoNo : I.ojo; ojo.setAttribute('aria-label', ver ? 'Ocultar la clave' : 'Mostrar la clave'); return; }
  if(t.closest('[data-crear]')){ var s0 = T.sesion.get() || {}; vista = 'crear'; acceso();
    document.getElementById('cxNombre').value = s0.nombre || ''; document.getElementById('cxCorreo').value = s0.email || ''; document.getElementById('cxClave').focus(); return; }
  var r = t.closest('[data-repetir]');
  if(r){ var p = T.pedidos.get(r.getAttribute('data-repetir'));
    p.items.forEach(function(x){ if(x.key) T.carrito.addKey(x.key, x.qty); else T.carrito.addEspacio(x.nombre, x.cat, x.origen); });
    T.abrir(); return; }
  if(t.closest('#cuSalir, #cuSalir2')){ A.salir(); location.hash = ''; vista = 'entrar'; pintar(); return; }
  if(t.closest('#cuClave')){ var s1 = T.sesion.get(); A.recuperar(s1.email).then(function(x){ pintar(x.ok ? 'Le enviamos un enlace a ' + s1.email + ' para cambiar su clave.' : x.error); }); return; }
  if(t.closest('#cuBorrar') && window.confirm('Se borrarán su sesión, pedidos, guardados y bolsa de este dispositivo. ¿Continuar?')){
    A.salir();
    ['sesion', 'pedidos', 'favs', 'vistos', 'datos', 'opiniones', 'carrito', 'reclamos', 'preguntas', 'testimonios'].forEach(function(k){ T.db(k, null); });
    location.href = 'cuenta';
  }
});
root.addEventListener('input', function(e){
  var c = e.target.closest('.cx-f'); if(c){ c.classList.remove('is-mal'); var msg = document.getElementById('cxMsg'); if(msg && !root.querySelector('.cx-f.is-mal')) msg.hidden = true; }
  if(e.target.id === 'cxClave'){ var m = root.querySelector('.cx-fuerza'); if(m) m.setAttribute('data-n', e.target.value ? fuerza(e.target.value) : 0); }
  var fld = e.target.closest('.gd-field.is-mal'); if(fld) fld.classList.remove('is-mal');
});
root.addEventListener('submit', function(e){
  e.preventDefault();
  var fm = e.target;
  if(fm.id === 'cxForm'){ enviarAcceso(); return; }
  if(fm.id === 'cuDatos'){
    var n = fm.querySelector('#cuNombre'), c = fm.querySelector('#cuCel'), m = fm.querySelector('#cuEmail');
    var ok = [[n, n.value.trim().length > 2], [c, !c.value.trim() || /^9\d{8}$/.test(c.value.trim())], [m, correoOk(m.value.trim())]];
    ok.forEach(function(x){ x[0].closest('.gd-field').classList.toggle('is-mal', !x[1]); });
    if(ok.some(function(x){ return !x[1]; })) return;
    var s = T.sesion.get() || {};
    s.nombre = n.value.trim(); s.cel = c.value.trim(); s.email = m.value.trim(); T.sesion.set(s);
    if(A.actual()) A.actualizar({ nombre:s.nombre, full_name:s.nombre, cel:s.cel });
    document.getElementById('cuOk').hidden = false;
    return;
  }
  if(fm.id === 'tsForm'){
    var g = function(id){ return fm.querySelector('#' + id); }, nps = fm.querySelector('input[name="tsNps"]:checked');
    var rr = [[g('tsProy'), g('tsProy').value.trim().length > 2], [g('tsAntes'), g('tsAntes').value.trim().length > 10], [g('tsDespues'), g('tsDespues').value.trim().length > 10]];
    rr.forEach(function(x){ x[0].closest('.gd-field').classList.toggle('is-mal', !x[1]); });
    fm.querySelector('.cu-nps').closest('.gd-field').classList.toggle('is-mal', !nps);
    var mal = fm.querySelector('.is-mal input, .is-mal textarea'); if(mal){ mal.focus(); return; }
    var se = T.sesion.get(), rol = g('tsRol').value.trim();
    var ts, tss = T.db('testimonios') || []; tss.unshift(ts = { id:T.uid(), autor:se.nombre, rol:rol, proyecto:g('tsProy').value.trim(), antes:g('tsAntes').value.trim(), despues:g('tsDespues').value.trim(), nps:+nps.value, publicar:g('tsPub').checked, fecha:new Date().toISOString() });
    T.db('testimonios', tss); T.nube('testimonios', ts.id, ts);
    window.open(T.wa('Hola Giandeco, dejo mi testimonio del proyecto ' + ts.proyecto + '.\n\nQué necesitaba resolver: ' + ts.antes + '\n\nQué cambió después: ' + ts.despues +
      '\n\nRecomendación: ' + ts.nps + '/10\n' + se.nombre + (rol ? ' · ' + rol : '') + '\n' + (ts.publicar ? 'Autorizo publicarlo con mi nombre y el de mi marca o proyecto.' : 'Prefiero que no se publique.')), '_blank', 'noopener');
  }
});
window.addEventListener('hashchange', function(){ if(T.sesion.get()){ pintar(); window.scrollTo(0, 0); } });
document.addEventListener('gd:favs', function(){ if(location.hash === '#favoritos') pintar(); });

/* ---------- arranque ---------- */
root.innerHTML = '<div class="cx-cargando" role="status" aria-label="Cargando su cuenta"><i></i></div>';
A.iniciar().then(function(r){
  if(r && r.error){ vista = 'entrar'; aviso = r.error; acceso(); return; }
  if(r && r.tipo === 'recovery'){ vista = 'nueva'; acceso(); return; }
  pintar(r && r.tipo === 'signup' ? 'Cuenta activada. Bienvenido.' : null);
  T.pedidos.sincronizar(function(){ pintar(); });
});
})();
