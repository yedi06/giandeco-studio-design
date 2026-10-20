/* ==========================================================================
   GIANDECO — MEDICIÓN Y PUBLICIDAD
   Google Analytics 4 · Meta Pixel · Microsoft Clarity · Google Ads (opcional)

   · Inerte hasta que se rellenen los IDs de abajo: sin IDs no carga nada ni
     muestra el banner.
   · Nada de terceros se carga sin consentimiento (banner Aceptar / Rechazar).
     Respeta la señal Global Privacy Control del navegador.
   · No envía datos personales (nombre, correo, teléfono, dirección).
   · Clarity no se carga en checkout, pagar, cuenta, seguimiento ni admin.
   · Depuración: añadir ?gd_debug=1 a la dirección muestra cada evento en consola.

   Eventos (GA4 → Meta):
     view_item → ViewContent · add_to_cart → AddToCart · begin_checkout →
     InitiateCheckout · generate_lead → Lead (pedido registrado, aún sin pagar) ·
     purchase → Purchase (pago confirmado) · whatsapp_click → Contact
   ========================================================================== */
(function(){
'use strict';

/* ---- 1. IDs: se rellenan cuando existan las cuentas ---------------------- */
var ID = {
  GA4:     '',     // Google Analytics 4: "G-XXXXXXXXXX"
  PIXEL:   '',     // Meta (conjunto de datos / píxel): solo números
  CLARITY: '',     // Microsoft Clarity: código del proyecto
  GADS:    '',     // Google Ads (opcional): "AW-XXXXXXXXX"
  GADS_COMPRA: ''  // Google Ads, conversión de compra (opcional): "AW-XXXXXXXXX/etiqueta"
};
var VERSION_CONSENTIMIENTO = 1;   // subir este número para volver a preguntar a todos
var MONEDA = 'PEN';

/* ---- 2. validación: un ID mal escrito nunca llega a una etiqueta <script> -- */
var RE = { GA4:/^G-[A-Z0-9]{6,14}$/, PIXEL:/^\d{10,20}$/, CLARITY:/^[a-z0-9]{8,14}$/, GADS:/^AW-\d{6,14}$/, GADS_COMPRA:/^AW-\d{6,14}\/[A-Za-z0-9_-]{6,40}$/ };
Object.keys(ID).forEach(function(k){ if(ID[k] && !RE[k].test(ID[k])){ try{ console.warn('[gd-medicion] ID inválido ignorado: ' + k); }catch(e){} ID[k] = ''; } });
var HAY_IDS = !!(ID.GA4 || ID.PIXEL || ID.CLARITY || ID.GADS);

var DEBUG = /[?&]gd_debug=1/.test(location.search);
function log(){ if(DEBUG){ try{ console.log.apply(console, ['[gd-medicion]'].concat([].slice.call(arguments))); }catch(e){} } }

/* ---- 3. consentimiento --------------------------------------------------- */
var CLAVE = 'gd:consent';
function leer(){ try{ var v = JSON.parse(localStorage.getItem(CLAVE) || 'null'); return v && v.v === VERSION_CONSENTIMIENTO ? v : null; }catch(e){ return null; } }
function guardar(ok){ try{ localStorage.setItem(CLAVE, JSON.stringify({ v:VERSION_CONSENTIMIENTO, m:!!ok, t:new Date().toISOString() })); }catch(e){} }
var cargado = false;

/* ---- 4. carga de etiquetas (solo tras aceptar) --------------------------- */
function script(src){ var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); return s; }
function sensible(){ return /(^|\/)(checkout|pagar|cuenta|seguimiento|admin)(\.html)?\/?$/.test(location.pathname); }

function cargarGA(){
  if(!ID.GA4 && !ID.GADS) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage:'granted', ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' });
  window.gtag('js', new Date());
  if(ID.GA4)  window.gtag('config', ID.GA4, { currency:MONEDA });
  if(ID.GADS) window.gtag('config', ID.GADS);
  script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID.GA4 || ID.GADS));
}
function cargarPixel(){
  if(!ID.PIXEL) return;
  /* snippet oficial de Meta */
  (function(f,b,e,v,n,t,s){ if(f.fbq) return; n = f.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if(!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', ID.PIXEL);
  window.fbq('track', 'PageView');
}
function cargarClarity(){
  if(!ID.CLARITY || sensible()) return;
  (function(c,l,a,r,i,t,y){ c[a] = c[a] || function(){ (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', ID.CLARITY);
  window.clarity('consentv2', { ad_Storage:'granted', analytics_Storage:'granted' });
}
function activar(){
  if(cargado) return; cargado = true;
  cargarGA(); cargarPixel(); cargarClarity();
  log('etiquetas cargadas');
  eventosDePagina();
}
function revocar(){
  try{ if(window.gtag) window.gtag('consent', 'update', { analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' }); }catch(e){}
  try{ if(window.fbq) window.fbq('consent', 'revoke'); }catch(e){}
  try{ if(window.clarity) window.clarity('consent', false); }catch(e){}
  cargado = false; log('consentimiento revocado');
}

/* ---- 5. envío de eventos ------------------------------------------------- */
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
function num(x){ return typeof x === 'number' && isFinite(x) ? Math.round(x * 100) / 100 : undefined; }
function item(x){
  var o = { item_id:String(x.key || x.id || ''), item_name:x.nombre || '', item_category:x.cat || '', quantity:x.qty || 1 };
  var p = num(x.valor); if(p !== undefined) o.price = p; return o;
}
function suma(items){ var t = 0, hay = false; items.forEach(function(i){ if(i.price !== undefined){ t += i.price * i.quantity; hay = true; } }); return hay ? Math.round(t * 100) / 100 : undefined; }
function contenidos(items){ return items.map(function(i){ return { id:i.item_id, quantity:i.quantity }; }); }

var META = { view_item:'ViewContent', add_to_cart:'AddToCart', begin_checkout:'InitiateCheckout', generate_lead:'Lead', purchase:'Purchase', whatsapp_click:'Contact' };

/* datos = { items:[...], value:n, transaction_id:'GD-…', extra:{...}, eventID:'…' } */
function evento(nombre, d){
  if(!cargado) return;
  d = d || {};
  var items = d.items || [], valor = d.value !== undefined ? num(d.value) : suma(items), id = d.eventID || uid();
  log('evento', nombre, { items:items, value:valor, id:id, extra:d.extra });
  try{
    if(window.gtag && (ID.GA4 || ID.GADS)){
      var p = { transport_type:'beacon' };
      if(items.length){ p.items = items; p.currency = MONEDA; }
      if(valor !== undefined){ p.value = valor; p.currency = MONEDA; }
      if(d.transaction_id) p.transaction_id = d.transaction_id;
      var ex = d.extra || {}; Object.keys(ex).forEach(function(k){ p[k] = ex[k]; });
      window.gtag('event', nombre, p);
      if(nombre === 'purchase' && ID.GADS_COMPRA) window.gtag('event', 'conversion', { send_to:ID.GADS_COMPRA, value:valor, currency:MONEDA, transaction_id:d.transaction_id });
    }
  }catch(e){ log('error ga', e); }
  try{
    if(window.fbq && ID.PIXEL && META[nombre]){
      var m = {};
      if(items.length){ m.content_ids = items.map(function(i){ return i.item_id; }); m.contents = contenidos(items); m.content_type = 'product'; m.num_items = items.reduce(function(a, i){ return a + i.quantity; }, 0);
        if(items.length === 1){ m.content_name = items[0].item_name; m.content_category = items[0].item_category; } }
      if(valor !== undefined){ m.value = valor; m.currency = MONEDA; }
      window.fbq('track', META[nombre], m, { eventID:id });
    }
  }catch(e){ log('error meta', e); }
}

/* ---- 6. eventos de la tienda --------------------------------------------- */
var T = window.GD_TIENDA || null;

function clavePieza(){
  var b = document.body; if(!b) return '';
  var k = b.getAttribute('data-p'); if(k) return k;
  if(/(^|\/)producto(\.html)?$/.test(location.pathname)){ try{ return new URLSearchParams(location.search).get('p') || ''; }catch(e){} }
  return '';
}

/* lo que se dispara al cargar la página (y al aceptar cookies en la misma página) */
function eventosDePagina(){
  if(!T) T = window.GD_TIENDA || null;
  var k = clavePieza();
  if(k && T && T.CAT && T.CAT[k]){ var p = T.CAT[k]; evento('view_item', { items:[ item({ key:k, nombre:p.nombre, cat:p.cat, valor:p.valor, qty:1 }) ] }); }
  if(T && /(^|\/)checkout(\.html)?\/?$/.test(location.pathname) && !/[?&]ok=/.test(location.search)){
    var l = T.carrito.lineas();
    if(l.length) evento('begin_checkout', { items:l.map(item) });
  }
}

function enganchar(){
  if(!T) T = window.GD_TIENDA || null;
  if(T && T.carrito && !T.carrito.__med){
    var add = T.carrito.add;
    T.carrito.add = function(it, qty){
      var r = add.apply(this, arguments);
      try{ var x = {}; for(var k in it){ x[k] = it[k]; } x.qty = Math.max(1, qty || 1); evento('add_to_cart', { items:[ item(x) ] }); }catch(e){}
      return r;
    };
    T.carrito.__med = true;
  }
  if(T && T.pedidos && !T.pedidos.__med){
    var crear = T.pedidos.crear;
    T.pedidos.crear = function(d){
      var r = crear.apply(this, arguments);
      try{
        var items = (r.items || []).map(item), v = (r.subtotal || 0) - (r.descuento || 0);
        evento('generate_lead', { items:items, value: r.subtotal ? v : undefined, eventID:'lead-' + r.n, extra:{ pedido:r.n, medio_pago:r.pagoKey || '' } });
      }catch(e){}
      return r;
    };
    T.pedidos.__med = true;
  }
}

/* pago confirmado: lo emite pagar.html una sola vez por pedido */
document.addEventListener('gd:pago', function(e){
  var d = (e && e.detail) || {}; if(!d.n) return;
  var hechos = []; try{ hechos = JSON.parse(localStorage.getItem('gd:med:compras') || '[]'); }catch(x){}
  if(hechos.indexOf(d.n) !== -1) return;
  if(!cargado) return;   // sin consentimiento no se envía; el servidor es la fuente de verdad
  hechos.push(d.n); try{ localStorage.setItem('gd:med:compras', JSON.stringify(hechos.slice(-50))); }catch(x){}
  evento('purchase', { items:(d.items || []).map(item), value:typeof d.monto === 'number' ? d.monto : undefined, transaction_id:d.n, eventID:'purchase-' + d.n });
});

/* clic a WhatsApp */
document.addEventListener('click', function(e){
  var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"], a[href*="api.whatsapp.com"]') : null;
  if(!a) return;
  evento('whatsapp_click', { extra:{ origen:location.pathname.replace(/\.html$/, ''), texto:(a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) } });
}, true);

/* ---- 7. banner de cookies -------------------------------------------------- */
var banner = null;
function estilo(){
  if(document.getElementById('gdCkCss')) return;
  var s = document.createElement('style'); s.id = 'gdCkCss';
  s.textContent =
    '#gdCk{position:fixed;left:16px;bottom:16px;z-index:2147483000;max-width:420px;width:calc(100vw - 32px);box-sizing:border-box;background:#0A0A09;color:#DED8CB;' +
    'border:1px solid rgba(201,162,74,.55);padding:20px 20px 18px;font:300 14px/1.55 Jost,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.45)}' +
    '#gdCk p{margin:0 0 14px}#gdCk b{font-weight:500;color:#fff}#gdCk a{color:#C9A24A;text-decoration:underline;text-underline-offset:3px}' +
    '#gdCk .gdck-b{display:flex;gap:10px}#gdCk button{flex:1;cursor:pointer;font:500 12px/1 Jost,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;' +
    'padding:14px 10px;border:1px solid #C9A24A;background:transparent;color:#C9A24A;border-radius:0}' +
    '#gdCk button:hover,#gdCk button:focus-visible{background:#C9A24A;color:#0A0A09;outline:none}' +
    '@media(max-width:560px){#gdCk{left:0;right:0;bottom:0;max-width:none;width:100%;border-left:0;border-right:0;border-bottom:0;padding-bottom:calc(18px + env(safe-area-inset-bottom))}}';
  document.head.appendChild(s);
}
function cerrarBanner(){ if(banner && banner.parentNode) banner.parentNode.removeChild(banner); banner = null; }
function abrirBanner(){
  if(!HAY_IDS || banner) return;
  estilo();
  banner = document.createElement('div'); banner.id = 'gdCk'; banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-label', 'Preferencias de cookies');
  banner.innerHTML = '<p><b>Su privacidad.</b> Usamos cookies de medición y publicidad (Google, Meta y Microsoft) para entender cómo se usa la web y mostrar anuncios relevantes. ' +
    'Las necesarias para comprar siempre están activas. <a href="legal/politica-de-privacidad#cookies">Más información</a>.</p>' +
    '<div class="gdck-b"><button type="button" data-ck="no">Rechazar</button><button type="button" data-ck="si">Aceptar</button></div>';
  banner.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('button[data-ck]'); if(!b) return;
    var ok = b.getAttribute('data-ck') === 'si', antes = leer();
    guardar(ok); cerrarBanner();
    if(ok) activar(); else if(cargado || (antes && antes.m)) revocar();
  });
  document.body.appendChild(banner);
}

document.addEventListener('click', function(e){
  var l = e.target && e.target.closest ? e.target.closest('[data-gd-cookies]') : null;
  if(l && HAY_IDS){ e.preventDefault(); abrirBanner(); }
});

/* ---- 8. arranque ----------------------------------------------------------- */
function iniciar(){
  enganchar();
  if(!HAY_IDS){ log('sin IDs: inerte'); return; }
  var c = leer();
  if(c){ if(c.m) activar(); return; }
  if(navigator.globalPrivacyControl === true){ guardar(false); log('GPC activo: rechazado'); return; }
  abrirBanner();
}
window.GD_MEDICION = { abrir:abrirBanner, estado:function(){ var c = leer(); return { ids:HAY_IDS, consentimiento:c ? c.m : null, cargado:cargado }; } };
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
