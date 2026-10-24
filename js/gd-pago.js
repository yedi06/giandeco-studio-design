/* ==========================================================================
   GIANDECO — PAGO EN LÍNEA  (Izipay · formulario incrustado SmartForm)
   Habla con la función backend/functions/pago y muestra el formulario de
   Izipay dentro de la página. Los datos de tarjeta se escriben en campos que
   Izipay sirve desde su propio dominio y viajan directo a Izipay: esta web
   solo recibe la respuesta firmada y se la pasa al servidor, que comprueba la
   firma y es quien da el pedido por pagado.

   El monto no se decide aquí: lo calcula el servidor.
   La interfaz pública (GD_PAGO) es la misma de siempre: checkout.html y
   pagar.html no necesitan saber qué pasarela hay detrás.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA;
if(!T || window.GD_PAGO) return;

var FN = T.NUBE.url + '/functions/v1/pago';
function llamar(cuerpo){
  return fetch(FN, { method:'POST', headers:{ 'Content-Type':'application/json', apikey:T.NUBE.key }, body:JSON.stringify(cuerpo) })
    .then(function(r){ return r.json(); }).catch(function(){ return null; });
}

/* ---------- biblioteca de Izipay ---------- */
var CDN = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/';
var cargados = {};
function cargar(src, attrs){
  return cargados[src] || (cargados[src] = new Promise(function(ok, mal){
    var s = document.createElement('script'); s.src = src; s.async = true;
    Object.keys(attrs || {}).forEach(function(k){ s.setAttribute(k, attrs[k]); });
    s.onload = ok; s.onerror = function(){ delete cargados[src]; mal(new Error(src)); };
    document.head.appendChild(s);
  }));
}
function hoja(href){
  if(document.querySelector('link[href="' + href + '"]')) return;
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
}
function libreria(pk){
  hoja(CDN + 'ext/neon-reset.min.css');
  return cargar(CDN + 'stable/kr-payment-form.min.js', {
    'kr-public-key':pk, 'kr-language':'es-ES',
    'kr-placeholder-pan':'0000 0000 0000 0000', 'kr-placeholder-expiry':'MM / AA',
    'kr-placeholder-security-code':'123', 'kr-placeholder-card-holder-name':'Como figura en la tarjeta' })
    .then(function(){ return cargar(CDN + 'ext/neon.js'); })
    .then(function(){ if(!window.KR) throw new Error('KR'); return window.KR; });
}

/* ---------- diseño de la página de pago (pagar.html) y de los campos ---------- */
var CSS_PAGINA = [
  '#pg.es-pago{ max-width:none; }',
  '#pg.es-pago .pg-grid{ grid-template-columns:minmax(0,1fr); gap:clamp(24px,4vw,40px); align-items:start; }',
  '@media (min-width:1000px){ #pg.es-pago .pg-grid{ grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr); gap:clamp(40px,5vw,88px); } }',
  '#pg.es-pago .pg-pago, #pg.es-pago .pg-res{ position:relative; background:var(--bg-raised); border:1px solid var(--line); border-radius:4px; padding:clamp(24px,3.4vw,44px); }',
  '#pg.es-pago .pg-pago::before, #pg.es-pago .pg-res::before{ content:""; position:absolute; left:-1px; right:-1px; top:-1px; height:2px; border-radius:4px 4px 0 0; background:linear-gradient(90deg,var(--accent),transparent 72%); }',
  '#pg.es-pago .pg-res{ position:sticky; top:calc(var(--h-total,80px) + 16px); padding:clamp(24px,3vw,36px); }',
  '#pg.es-pago .pg-t{ font-size:clamp(1.5rem,2.2vw,1.85rem); margin:0 0 8px; }',
  '#pg.es-pago .pg-pago .co-ayuda{ max-width:none; margin:0 0 22px; font-size:.88rem; line-height:1.65; }',
  '#pg.es-pago .pg-medios, #pg.es-pago .pg-sellos{ max-width:none !important; width:100%; box-sizing:border-box; }',
  '#pg.es-pago .pg-medios{ display:flex; align-items:center; gap:14px; margin:0 0 26px; padding:0 0 24px; border-bottom:1px solid var(--line); }',
  '#pg.es-pago .pg-medios > span:first-child{ font-size:.64rem; letter-spacing:.18em; text-transform:uppercase; color:var(--text-dim); }',
  '#pg.es-pago #pgCulqi{ max-width:none !important; min-height:0 !important; padding:0 !important; background:transparent !important; border:0 !important; border-radius:0 !important; }',
  '#pg.es-pago .pg-sellos{ display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px 20px; margin:28px 0 0; padding:22px 0 0; border-top:1px solid var(--line); list-style:none; }',
  '#pg.es-pago .pg-sellos li{ display:flex; align-items:center; gap:9px; font-size:.74rem; letter-spacing:.02em; color:var(--text-dim); }',
  '#pg.es-pago .gd-form-nota{ margin:18px 0 0; font-size:.78rem; color:var(--text-faint); }',
  '#pg.es-pago .pg-prueba{ display:inline-flex; align-items:center; gap:9px; padding:8px 15px 8px 13px; border:1px solid var(--line); border-radius:999px; background:var(--bg-raised); }',
  '#pg.es-pago .pg-prueba::before{ content:""; width:6px; height:6px; border-radius:50%; background:#D9A441; box-shadow:0 0 0 3px rgba(217,164,65,.18); }',
  /* resumen del pedido */
  '#pg.es-pago .co-res h2{ margin:0 0 4px; }',
  '#pg.es-pago .co-res .gdt-line{ grid-template-columns:76px 1fr; gap:18px; padding:20px 0; border-bottom:1px solid var(--line); }',
  '#pg.es-pago .co-res .gdt-line-img{ width:76px; height:96px; border-radius:2px; }',
  '#pg.es-pago .co-tot{ margin:6px 0 0; }',
  '#pg.es-pago .co-tot > div{ display:flex; justify-content:space-between; align-items:baseline; padding:9px 0; }',
  '#pg.es-pago .co-tot dt{ font-size:.82rem; color:var(--text-dim); }',
  '#pg.es-pago .co-tot dd{ margin:0; font-size:.88rem; color:var(--lino); font-variant-numeric:tabular-nums; }',
  '#pg.es-pago .co-tot .es-total{ margin-top:8px; padding:22px 0 6px; border-top:1px solid var(--line); align-items:flex-end; }',
  '#pg.es-pago .co-tot .es-total dt{ font-size:.68rem; letter-spacing:.18em; text-transform:uppercase; color:var(--text-dim); padding-bottom:6px; }',
  '#pg.es-pago .co-tot .es-total dd{ font-family:var(--display); font-size:clamp(2rem,2.8vw,2.5rem); font-weight:400; line-height:1; color:var(--lino); }',
  '#pg.es-pago .co-tot .es-igv{ padding:2px 0 0; }',
  '#pg.es-pago .co-tot .es-igv dt, #pg.es-pago .co-tot .es-igv dd{ font-size:.72rem; color:var(--text-faint); }',
  /* formulario: dos columnas (vencimiento + código), etiquetas arriba */
  '#pgCulqi .kr-embedded{ display:grid !important; grid-template-columns:1fr 1fr; gap:20px 16px; }',
  '#pgCulqi .kr-embedded > *{ grid-column:1 / -1; min-width:0; }',
  '#pgCulqi .kr-embedded > .kr-expiry{ grid-column:1; }',
  '#pgCulqi .kr-embedded > .kr-security-code{ grid-column:2; }',
  '#pgCulqi .kr-field-element{ flex-direction:column !important; align-items:stretch !important; height:auto !important; gap:9px; background:transparent !important; border:0 !important; box-shadow:none !important; }',
  '#pgCulqi .kr-field-element.kr-pan::before{ content:"Número de tarjeta"; }',
  '#pgCulqi .kr-field-element.kr-expiry::before{ content:"Vencimiento"; }',
  '#pgCulqi .kr-field-element.kr-security-code::before{ content:"Código CVV"; }',
  '#pgCulqi .kr-field-element.kr-card-holder-name::before{ content:"Nombre del titular"; }',
  '#pgCulqi .kr-field-element.kr-pan::before, #pgCulqi .kr-field-element.kr-expiry::before, #pgCulqi .kr-field-element.kr-security-code::before, #pgCulqi .kr-field-element.kr-card-holder-name::before{ font-size:.64rem; letter-spacing:.17em; text-transform:uppercase; color:var(--text-dim); }',
  '#pgCulqi .kr-field-wrapper{ box-sizing:border-box !important; width:100% !important; height:56px !important; min-height:56px; align-items:center; padding:0 6px 0 16px; border:1px solid var(--line) !important; border-radius:3px !important; background:rgba(255,255,255,.028) !important; transition:border-color .2s, box-shadow .2s; }',
  '#pgCulqi .kr-field-component{ flex:1 1 auto; min-width:0; }',
  '#pgCulqi .kr-field-wrapper:focus-within, #pgCulqi .kr-field-wrapper.kr-focus{ border-color:var(--accent) !important; box-shadow:0 0 0 3px rgba(201,162,74,.14) !important; }',
  '#pgCulqi .kr-payment-button{ height:60px !important; width:100% !important; margin-top:8px; display:flex; flex-direction:row !important; align-items:center; justify-content:center; gap:11px; font-size:.78rem !important; letter-spacing:.2em !important; box-shadow:0 12px 28px -18px rgba(201,162,74,.6) !important; transition:filter .2s, transform .2s; }',
  '#pgCulqi .kr-payment-button:hover{ transform:translateY(-1px); }',
  '#pgCulqi .kr-payment-button .kr-spinner{ position:absolute; }',
  '#pgCulqi .kr-payment-button::before{ content:""; width:15px; height:15px; background:currentColor; -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5z%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272%27/%3E%3C/svg%3E") center/contain no-repeat; mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5z%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272%27/%3E%3C/svg%3E") center/contain no-repeat; }',
  ':root[data-tema="claro"] #pgCulqi .kr-field-wrapper{ background:rgba(0,0,0,.03) !important; }',
  /* --- bloque de seguridad con la marca de Izipay --- */
  '#pg.es-pago .pg-seguro{ display:flex; align-items:center; gap:16px; margin:0 0 24px; padding:16px 18px; border:1px solid rgba(201,162,74,.3); border-radius:3px; background:linear-gradient(100deg,rgba(201,162,74,.09),rgba(201,162,74,.025)); }',
  '#pg.es-pago .pg-seguro-ic{ display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; flex:none; border-radius:50%; border:1px solid rgba(201,162,74,.45); }',
  '#pg.es-pago .pg-seguro-ic svg{ width:18px; height:18px; fill:none; stroke:var(--accent); stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }',
  '#pg.es-pago .pg-seguro-t{ display:flex; flex-direction:column; gap:3px; flex:1 1 0; min-width:0; }',
  '#pg.es-pago .pg-seguro-t b{ font-weight:500; font-size:.9rem; color:var(--lino); }',
  '#pg.es-pago .pg-seguro-t span{ font-size:.78rem; line-height:1.5; color:var(--text-dim); }',
  '#pg.es-pago .pg-seguro-izi{ display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex:none; }',
  '#pg.es-pago .pg-seguro-izi small{ font-size:.58rem; letter-spacing:.2em; text-transform:uppercase; color:var(--text-faint); }',
  '.pg-izi{ display:inline-flex; align-items:center; justify-content:center; min-width:92px; height:36px; padding:0 10px; border-radius:3px; background:#101012; border:1px solid rgba(255,255,255,.1); font-size:.95rem; font-weight:600; letter-spacing:.02em; color:#4ED0D2; }',
  '.pg-izi img{ display:block; width:72px; height:24px; object-fit:contain; }',
  '#pg.es-pago .pg-cobro{ display:flex; align-items:flex-start; gap:10px; margin:14px 0 0; font-size:.78rem; line-height:1.55; color:var(--text-dim); }',
  '#pg.es-pago .pg-cobro svg{ width:15px; height:15px; margin-top:2px; flex:none; fill:none; stroke:var(--accent); stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }',
  '#pg.es-pago .pg-cobro b{ font-weight:500; color:var(--lino); }',
  '#pg.es-pago .pg-estado .co-lead{ max-width:none; margin:0 0 var(--sp-24); }',
  '#pg.es-pago .pg-estado .gd-form{ max-width:560px; }',
  '#pg.es-pago .pg-estado .co-ok-acc{ margin-top:var(--sp-24); }',
  '@media (max-width:999px){ #pg.es-pago .pg-grid .pg-estado{ order:-2; } #pg.es-pago .pg-res{ position:static; } #pg.es-pago .pg-sellos{ flex-direction:column; } #pg.es-pago .pg-res{ padding:20px 22px; } #pg.es-pago .pg-res .gdt-line{ grid-template-columns:52px 1fr; padding:10px 0; } #pg.es-pago .pg-res .gdt-line-img{ width:52px; height:65px; } }',
    '@media (max-width:520px){ #pg.es-pago .pg-pago{ padding:22px 16px 24px; } #pg.es-pago .pg-res{ padding:18px 16px; } #pg.es-pago .pg-seguro{ flex-wrap:wrap; gap:12px 14px; padding:14px; } #pg.es-pago .pg-seguro-izi{ flex-direction:row; align-items:center; justify-content:space-between; width:100%; padding-top:12px; border-top:1px solid rgba(201,162,74,.22); } #pgCulqi .kr-embedded{ gap:18px 12px; } #pgCulqi .kr-field-wrapper{ padding:0 4px 0 12px; } #pgCulqi .kr-expiry .kr-icon-wrapper-root{ display:none !important; } }'
].join('\n');

/* ---------- apariencia: el formulario toma los colores del sitio (oscuro o claro) ---------- */
function estilo(){
  if(document.getElementById('gdPagoCss')) return;
  var s = document.createElement('style'); s.id = 'gdPagoCss';
  s.textContent =
    '#pgCulqi{ height:auto; min-height:300px; overflow:visible; max-width:540px !important; padding:22px 22px 24px; }' +
    '#pgCulqi .kr-smart-form, #pgCulqi .kr-embedded{ width:100% !important; max-width:none !important; }' +
    '#pgCulqi .kr-field-element{ width:100% !important; }' +
    '#pgCulqi .kr-card-header{ display:none !important; }' +   /* las marcas ya se ven arriba, en "Aceptamos" */
    '#pgCulqi .kr-first-installment-delay, #pgCulqi .kr-installment-number.kr-read-only{ display:none !important; }' +   /* "Pago sin diferido" y "Sin cuotas" cuando no hay nada que elegir */
    '#pgCulqi .kr-smart-form, #pgCulqi .kr-embedded{ background:transparent !important; color:var(--text-dim) !important; font-family:inherit !important; box-shadow:none !important; border:0 !important; }' +
    '#pgCulqi .kr-smart-form *{ font-family:inherit; }' +
    '#pgCulqi .kr-field-wrapper label, #pgCulqi .kr-smart-form label{ color:var(--text-dim) !important; font-size:.66rem !important; letter-spacing:.12em; text-transform:uppercase; }' +
    '#pgCulqi .kr-smart-form input, #pgCulqi .kr-smart-form select, #pgCulqi .kr-field-control, #pgCulqi .kr-field-element{ background:var(--bg-raised) !important; color:var(--lino) !important; border-color:var(--line) !important; border-radius:2px !important; }' +
    '#pgCulqi .kr-smart-form input:focus, #pgCulqi .kr-field-control.kr-focus, #pgCulqi .kr-field-wrapper.kr-focus .kr-field-control{ border-color:var(--accent) !important; box-shadow:none !important; }' +
    '#pgCulqi .kr-field-component{ background:transparent !important; }' +
    '#pgCulqi .kr-card-header{ background:var(--bg-raised) !important; border-color:var(--line) !important; border-radius:2px !important; }' +
    '#pgCulqi .kr-card-header-label{ color:var(--text-dim) !important; }' +
    '#pgCulqi .kr-payment-button{ background:#C9A24A !important; color:#0A0A09 !important; border:0 !important; border-radius:2px !important; letter-spacing:.16em; text-transform:uppercase; font-weight:500; font-size:.74rem !important; }' +
    '#pgCulqi .kr-payment-button:hover{ filter:brightness(1.06); }' +
    '#pgCulqi .kr-payment-button[disabled], #pgCulqi .kr-payment-button.kr-disabled{ opacity:.55; }' +
    '#pgCulqi .kr-form-error, #pgCulqi .kr-error-message{ color:#D9917F !important; }' +
    ':root[data-tema="claro"] #pgCulqi .kr-payment-button{ background:#8A6F3C !important; color:#F4F1EA !important; }' +
    CSS_PAGINA;
  document.head.appendChild(s);
}

/* ---------- confianza: pasos, bloque de seguridad con la marca de Izipay y aviso del cobro ---------- */
var IZI_LOGO = 'https://cdnwebb.izipay.pe/rsrc/_next/static/media/Logo.d654b6dd.png';
var SVG_CANDADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>';
function marcaIzipay(){
  var s = document.createElement('span'), im = new Image();
  s.className = 'pg-izi';
  im.alt = 'Izipay'; im.width = 72; im.height = 24; im.decoding = 'async'; im.referrerPolicy = 'no-referrer';
  im.onerror = function(){ if(im.parentNode) im.parentNode.removeChild(im); s.textContent = 'izipay'; };   // si el logo no carga queda el nombre
  im.src = IZI_LOGO; s.appendChild(im);
  return s;
}
function realzar(caja){
  var pago = caja.closest ? caja.closest('.pg-pago') : null;
  if(!pago || pago.querySelector('.pg-seguro')) return;
  var grid = pago.closest('.pg-grid'), ayuda = pago.querySelector('.co-ayuda'), medios = pago.querySelector('.pg-medios');

  if(grid && grid.parentNode && !grid.parentNode.querySelector('.co-ruta')){   // misma ruta que el checkout: 1 Sus datos · 2 Entrega · 3 Pago
    var ol = document.createElement('ol'); ol.className = 'co-ruta'; ol.setAttribute('aria-label', 'Progreso de su compra');
    ol.innerHTML = '<li class="is-hecho"><i>1</i><span>Sus datos</span></li><li class="is-hecho"><i>2</i><span>Entrega</span></li><li class="is-activo" aria-current="step"><i>3</i><span>Pago</span></li>';
    grid.parentNode.insertBefore(ol, grid.parentNode.firstChild);
  }
  if(ayuda){ ayuda.textContent = 'Complete los datos de su tarjeta' + (/Yape/.test(ayuda.textContent) ? ' o elija Yape' : '') + '. Solo toma un minuto.'; }

  var b = document.createElement('div'); b.className = 'pg-seguro'; b.setAttribute('role', 'note');
  b.innerHTML = '<span class="pg-seguro-ic">' + SVG_CANDADO + '</span>' +
    '<span class="pg-seguro-t"><b>Pago 100 % seguro</b><span>Sus datos viajan cifrados directo a Izipay. Giandeco nunca ve ni guarda su tarjeta.</span></span>' +
    '<span class="pg-seguro-izi"><small>Procesado por</small></span>';
  b.querySelector('.pg-seguro-izi').appendChild(marcaIzipay());
  pago.insertBefore(b, medios || caja);

  var tot = document.querySelector('#pg .es-total dd'), p = document.createElement('p');
  p.className = 'pg-cobro';
  p.innerHTML = SVG_CANDADO + '<span>' + (tot ? 'Se cobrará <b>' + tot.textContent.trim() + '</b> en un solo pago, en soles. ' : 'El cobro es en un solo pago, en soles. ') +
    'Recibirá su comprobante electrónico por correo.</span>';
  caja.parentNode.insertBefore(p, caja.nextSibling);
}


var actual = null;   // KR en pantalla

/* Muestra el formulario y cobra.
   o = { n, cel, cuenta (respuesta de consulta), contenedor ('#id' donde incrustarlo), alProcesar(), alTerminar(resultado) }
   resultado = { ok:true, … }  |  { ok:false, mensaje | motivo }  |  { cerrado:true } */
function pagar(o){
  var fin = false;
  function terminar(r){ if(fin) return; fin = true; cerrar(); o.alTerminar(r || { ok:false, motivo:'error' }); }
  function falla(){ terminar({ ok:false, mensaje:'No se pudo abrir el formulario de pago. Revise su conexión e inténtelo de nuevo.' }); }

  llamar({ accion:'iniciar', n:o.n, cel:o.cel }).then(function(r){
    if(!r) return falla();
    if(r.ok && r.pagado) return terminar({ ok:true, pagado:true });
    if(!r.ok || !r.formToken) return terminar(r);
    return libreria(r.pk).then(function(KR){ montar(KR, r); });
  }).catch(falla);

  function montar(KR, r){
    var caja = document.querySelector(o.contenedor);
    if(!caja || fin) return;
    estilo(); realzar(caja);
    var espera = caja.querySelector('.pg-espera');
    caja.innerHTML = ''; if(espera) caja.appendChild(espera);
    var lugar = document.createElement('div');
    lugar.className = 'kr-smart-form'; lugar.setAttribute('kr-card-form-expanded', '');
    caja.appendChild(lugar);

    actual = KR;
    /* lo que devuelve el formulario cuando el banco aprobó el pago.
       Se devuelve false: no se redirige a ninguna parte, esta página sigue en control. */
    KR.onSubmit(function(ev){
      var ans = ev && ev.clientAnswer, raw = ev && (ev.rawClientAnswer || (ans ? JSON.stringify(ans) : ''));
      if(!ans || ans.orderStatus !== 'PAID') return false;           // un intento rechazado se queda en el formulario
      var hash = ev.hash;
      setTimeout(function(){ o.alProcesar(); confirmar(raw, hash); }, 0);   // la pantalla se cambia fuera del callback del formulario
      return false;
    });
    KR.onError(function(){ /* el propio formulario muestra el error y deja corregir */ });
    KR.onFormReady(function(){ caja.classList.add('is-lista'); });
    /* setFormConfig ya pinta el formulario en el .kr-smart-form de la página (llamar además a renderElements lo duplica y da error) */
    KR.setFormConfig({ formToken:r.formToken, 'kr-language':'es-ES' })
      .then(function(){ setTimeout(function(){ caja.classList.add('is-lista'); }, 4000); })
      .catch(falla);
  }

  /* el servidor comprueba la firma, el estado y el monto. Si no contesta, la notificación (IPN) de Izipay
     marca el pedido por su lado: se consulta unos segundos antes de decir que "está en verificación". */
  function confirmar(raw, hash){
    llamar({ accion:'confirmar', n:o.n, cel:o.cel, answer:raw, hash:hash }).then(function(r){
      if(r && r.ok && r.pagado) return terminar(r);
      if(r && r.motivo === 'incierto') return terminar(r);
      verificar(0);
    });
  }
  function verificar(i){
    llamar({ accion:'consulta', n:o.n, cel:o.cel }).then(function(r){
      if(r && r.ok && r.pagado){ var p = r.pago || {}; return terminar({ ok:true, pagado:true, ref:p.ref, medio:p.medio, marca:p.marca, ultimos4:p.ultimos4 }); }
      if(i >= 6) return terminar({ ok:false, motivo:'incierto' });
      setTimeout(function(){ verificar(i + 1); }, 2500);
    });
  }
}

function cerrar(){
  try{ if(actual){ actual.removeForms(); } }catch(e){}
  actual = null;
}

/* ¿hay pasarela? Se recuerda en el dispositivo para pintar sin esperar. */
var EN_LINEA = ['culqi', 'tarjeta', 'cuotas'];   // 'culqi' es el nombre interno del medio "pago en línea" en js/gd-tienda.js (no es la pasarela)
function yape(on){ var i = EN_LINEA.indexOf('yape'); if(on && i === -1) EN_LINEA.push('yape'); else if(!on && i !== -1) EN_LINEA.splice(i, 1); }
yape(T.db('pasarela_yape') === true);
function estado(){
  return llamar({ accion:'estado' }).then(function(r){
    var a = !!(r && r.activa); T.db('pasarela', a); T.db('pasarela_yape', a && !!r.yape); yape(a && !!r.yape); return a;
  });
}
function consulta(n, cel){ return llamar({ accion:'consulta', n:n, cel:cel }); }

estilo();   // los estilos van desde el principio: la página no cambia de forma cuando llega el formulario

window.GD_PAGO = {
  estado: estado, consulta: consulta, pagar: pagar, cerrar: cerrar,
  activa: function(){ return T.db('pasarela') === true; },
  /* medios que se cobran en línea cuando hay pasarela (Yape solo si está activo en la tienda de Izipay) */
  EN_LINEA: EN_LINEA
};
})();
