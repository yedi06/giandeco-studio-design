/* ==========================================================================
   GIANDECO — MI CUENTA Y ACCESO
   Según el lienzo «Giandeco · Mi cuenta y acceso». Tres estados que nunca se
   mezclan:
     1. sin sesión          → acceso (Google, correo y clave, crear cuenta)
     2. compró como invitado → «Sus pedidos» + un solo botón: «Activar mi cuenta»
     3. cliente con cuenta   → panel completo (inicio, pedidos, proyectos,
                               guardados, beneficios, direcciones, datos)
   La lógica de acceso (js/gd-auth.js) y los pedidos (js/gd-tienda.js) no cambian.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA, A = window.GD_AUTH;
if(!T || !A) return;
var esc = T.esc, root = document.getElementById('cu'), host = document.getElementById('cx');
document.body.classList.add('cx-body');

/* ---------- iconos (trazo fino) ---------- */
function svg(d, extra){ return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>'; }
var I = {
  inicio:   svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>'),
  pedidos:  svg('<path d="M5 7.5h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 9.5V6.8a3 3 0 0 1 6 0v2.7"/>'),
  proyectos:svg('<path d="M4 20V9l8-5 8 5v11"/><path d="M9.5 20v-6h5v6"/>'),
  guardados:svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  beneficios:svg('<rect x="3.5" y="8" width="17" height="12" rx="1"/><path d="M12 8v12M3.5 12.5h17M12 8c-2.5 0-4.5-1-4.5-2.8S10 3 12 8c2-5 4.5-3.5 4.5-1.8S14.5 8 12 8z"/>'),
  direcciones:svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  datos:    svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  salir:    svg('<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16l-4-4 4-4M6 12h10"/>'),
  ojo:      svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
  ojoNo:    svg('<path d="M3 3l18 18"/><path d="M10.6 5.6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.6 6.7C4 8.4 2.5 12 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 4.1-.9"/><path d="M9.9 9.9a2.8 2.8 0 0 0 4 4"/>'),
  escudo:   svg('<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>'),
  wa:       svg('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z"/><path d="M9.2 8.6c.2-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.5-.2.7-.1l1.5.7c.2.1.4.3.4.5v.5c0 .4-.1.7-.5.9-1.6.9-4.2-.5-5.6-1.9s-2.8-4-1.9-5.4z"/>'),
  waMsg:    svg('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z"/><path d="M9 11h6M9 14h3.5"/>'),
  repetir:  svg('<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20v-4.5h4.5"/>'),
  tarjeta:  svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  correo:   svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>'),
  doc:      svg('<path d="M7 3.5h7l4 4V20.5H7z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/>'),
  check:    svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  flecha:   svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  chev:     svg('<path d="M9 5l7 7-7 7"/>'),
  atras:    svg('<path d="M15 5l-7 7 7 7"/>'),
  abajo:    svg('<path d="M6 9l6 6 6-6"/>'),
  candado:  svg('<rect x="5" y="10.5" width="14" height="9.5" rx="1"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>', ' class="cx-lock"'),
  navidad:  svg('<path d="M12 3v18M7 7l10 10M17 7L7 17M3 12h18"/>'),
  envio:    svg('<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  mas:      svg('<path d="M12 5v14M5 12h14"/>'),
  agenda:   svg('<rect x="3.5" y="5" width="17" height="15" rx="1"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  ayuda:    svg('<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 16.8v.2"/>')
};
var GOOGLE = '<svg viewBox="0 0 48 48" class="g" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function fecha(iso, corta){ return new Date(iso).toLocaleDateString('es-PE', corta ? { day:'numeric', month:'short' } : { day:'numeric', month:'short', year:'numeric' }).replace(/\./g, ''); }
function correoOk(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
function fuerza(c){ var n = 0; if(c.length >= 8) n++; if(c.length >= 12) n++; if(/[a-zA-Z]/.test(c) && /\d/.test(c)) n++; if(/[^a-zA-Z0-9]/.test(c) || /[a-z]/.test(c) && /[A-Z]/.test(c)) n++; return n; }
function iniciales(n){ return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function(x){ return x[0]; }).join('').toUpperCase() || 'G'; }
function saludo(){ var h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; }
function nombre1(s){ return String(s.nombre || '').split(/\s+/)[0] || ''; }
/* los documentos de identidad no se muestran enteros */
function ocultarDoc(t){ return String(t || '').replace(/\b(\d)(\d{5,9})(\d{2})\b/g, function(_, a, m, z){ return a + new Array(m.length + 1).join('•') + z; }); }
function edadDe(nac){
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nac || ''); if(!m) return null;
  var h = new Date(), e = h.getFullYear() - +m[1];
  if(h.getMonth() + 1 < +m[2] || (h.getMonth() + 1 === +m[2] && h.getDate() < +m[3])) e--;
  return e >= 0 && e < 130 ? e : null;
}

/* ==================== ACCESO ==================== */
var vista = 'entrar', aviso = null;
function campo(id, label, tipo, extra, err){
  return '<div class="cx-campo"><label class="cx-lb" for="' + id + '">' + label + '</label><div class="cx-ctl"><input class="cx-in" id="' + id + '" type="' + tipo + '" ' + (extra || '') + (tipo === 'password' ? ' style="padding-right:52px"' : '') + '>' +
    (tipo === 'password' ? '<button type="button" class="cx-ojo" data-ojo="' + id + '" aria-label="Mostrar la clave">' + I.ojo + '</button>' : '') +
    '</div><span class="cx-err">' + (err || '') + '</span></div>';
}
var TITULO = { entrar:'Bienvenido', crear:'Cree su cuenta', olvido:'Recuperar clave', nueva:'Nueva clave', enviado:'Revise su correo' };
var SUBT = { entrar:'Ingrese para seguir sus pedidos y su proyecto.', crear:'Siga sus pedidos y su proyecto desde cualquier dispositivo.', olvido:'Le enviamos un enlace para crear una nueva.', nueva:'Elija una clave que no haya usado antes.', enviado:'' };
function cuerpoAcceso(){
  var cab = vista === 'entrar' || vista === 'crear'
    ? '<div class="cx-seg es-2" role="tablist" aria-label="Acceso"><button type="button" role="tab" data-v="entrar" aria-selected="' + (vista === 'entrar') + '">Iniciar sesión</button>' +
      '<button type="button" role="tab" data-v="crear" aria-selected="' + (vista === 'crear') + '">Crear cuenta</button></div>' +
      '<button type="button" class="cx-google" id="cxGoogle">' + GOOGLE + '<span>Continuar con Google</span></button>' +
      '<div class="cx-o"><span>o con su correo</span></div>' : '';
  if(vista === 'enviado'){
    return '<div class="cx-enviado"><span class="cx-enviado-ico">' + I.correo + '</span><p class="cx-p">' + esc(aviso || '') + '</p>' +
      '<button type="button" class="cx-btn es-lleno" data-v="entrar"><span>Volver a iniciar sesión</span></button></div>';
  }
  var cuerpo = {
    entrar: campo('cxCorreo', 'Correo', 'email', 'autocomplete="email" placeholder="nombre@correo.com" required') +
      campo('cxClave', 'Clave', 'password', 'autocomplete="current-password" placeholder="Su clave" required') +
      '<button type="button" class="cx-olvido" data-v="olvido">¿Olvidó su clave?</button>',
    crear: campo('cxNombre', 'Nombre y apellido', 'text', 'autocomplete="name" placeholder="Nombre y apellido" required') +
      campo('cxCorreo', 'Correo', 'email', 'autocomplete="email" placeholder="nombre@correo.com" required') +
      campo('cxClave', 'Clave · mínimo 8 caracteres', 'password', 'autocomplete="new-password" minlength="8" placeholder="Su clave" required') +
      '<div class="cx-fuerza" aria-hidden="true"><i></i><i></i><i></i><i></i></div>',
    olvido: campo('cxCorreo', 'Correo', 'email', 'autocomplete="email" placeholder="nombre@correo.com" required'),
    nueva: campo('cxClave', 'Nueva clave · mínimo 8', 'password', 'autocomplete="new-password" minlength="8" placeholder="Nueva clave" required') +
      '<div class="cx-fuerza" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' + campo('cxClave2', 'Repita la clave', 'password', 'autocomplete="new-password" placeholder="Repita la clave" required')
  }[vista];
  var boton = { entrar:'Entrar', crear:'Crear cuenta', olvido:'Enviar enlace', nueva:'Guardar clave' }[vista];
  return cab + '<form class="cx-form" id="cxForm" novalidate>' + cuerpo +
    '<p class="cx-msg" id="cxMsg" role="alert"' + (aviso ? '' : ' hidden') + '>' + esc(aviso || '') + '</p>' +
    '<button type="submit" class="cx-btn es-lleno"><span>' + boton + '</span><i class="cx-giro" aria-hidden="true"></i></button></form>' +
    (vista === 'entrar' ? '<div class="cx-aviso">' + I.escudo + '<p><b>¿Compró como invitado?</b> Cree su cuenta con el mismo correo y verá sus pedidos en cualquier dispositivo.</p></div>' +
      '<p class="cx-legal-inv">¿Compró como invitado? Cree su cuenta con el mismo correo<br>y verá sus pedidos en cualquier dispositivo.</p>' : '') +
    (vista === 'crear' ? '<p class="cx-legal">Al crear su cuenta acepta los <a href="legal/terminos-y-condiciones">términos</a> y la <a href="legal/politica-de-privacidad">privacidad</a>.</p>' : '') +
    (vista === 'olvido' || vista === 'nueva' ? '<button type="button" class="cx-atras" data-v="entrar">← Volver a iniciar sesión</button>' : '');
}
function acceso(){
  document.body.classList.add('cx-auth-b');
  root.innerHTML = '<div class="cx-auth">' +
    '<section class="cx-auth-foto"><img src="images/work/convivir.jpg" alt="Proyecto Convivir con el Arte, de Giandeco" width="1200" height="1800" decoding="async" fetchpriority="high">' +
      '<a href="./" aria-label="Giandeco Studio Design"><img class="cx-auth-logo" src="img/logo-dorado.svg" alt="Giandeco Studio Design" width="300" height="268"></a>' +
      '<div class="cx-auth-pie"><div class="cx-auth-ben"><span>' + I.pedidos + 'Siga sus pedidos</span><span>' + I.guardados + 'Guarde piezas</span><span>' + I.proyectos + 'Vea su proyecto</span></div>' +
      '<p class="cx-auth-cred">Convivir con el Arte</p></div></section>' +
    '<section class="cx-auth-panel"><div class="cx-card" id="cxCard" data-vista="' + vista + '">' +
      '<div class="cx-card-cab"><p class="cx-k">Mi cuenta</p><h1 class="cx-h1">' + TITULO[vista] + '</h1>' + (SUBT[vista] ? '<p class="cx-p">' + SUBT[vista] + '</p>' : '') + '</div>' +
      cuerpoAcceso() + '</div></section></div>';
  aviso = null;
}
function irA(v, msg){ vista = v; aviso = msg || null; acceso(); var x = root.querySelector('.cx-card input'); if(x && window.innerWidth > 899) x.focus({ preventScroll:true }); }
function error(msg){ var m = document.getElementById('cxMsg'); if(m){ m.hidden = false; m.textContent = msg; m.classList.remove('es-ok'); } }
function ocupado(on){ var b = root.querySelector('.cx-form .cx-btn'); if(b){ b.disabled = on; b.classList.toggle('is-cargando', on); } }
function marcar(id, ok){ var el = document.getElementById(id); if(el) el.closest('.cx-campo').classList.toggle('is-mal', !ok); return ok; }

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

/* ==================== PEDIDOS: piezas compartidas ==================== */
var DICHO = ['Su pedido fue registrado', 'El estudio confirmó su pedido', 'Su pedido está en preparación', 'Su pedido va en camino', 'Su pedido fue entregado'];
function enCurso(p){ return p.estado < T.ESTADOS.length - 1; }
function pila(p, max){
  var n = max || 3, fotos = p.items.slice(0, n).map(function(x){ var c = x.key && T.CAT[x.key]; return c && c.img ? '<img src="' + esc(c.img) + '" alt="" loading="lazy" decoding="async">' : '<span>G</span>'; }).join('');
  return '<div class="cx-pila">' + fotos + '</div>';
}
function piezas(p){ return p.items.reduce(function(a, x){ return a + x.qty; }, 0); }
function chip(p){ var e = Math.min(p.estado, T.ESTADOS.length - 1); return '<span class="cx-chip' + (e === 3 ? ' es-oro' : '') + '">' + esc(T.ESTADOS[e]) + '</span>'; }
function pasos(p){
  var n = T.ESTADOS.length - 1, e = Math.min(p.estado, n);
  return '<ol class="cx-pasos" style="--av:' + e + '" aria-label="Estado del pedido">' + T.ESTADOS.map(function(t, i){
    var c = i < e || e === n ? 'hecho' : i === e ? 'ahora' : 'falta';
    return '<li class="' + c + '"><i>' + (c === 'hecho' ? I.check : '') + '</i><span>' + esc(t) + '</span></li>';
  }).join('') + '</ol>';
}
function resumenM(p, ver){
  var n = T.ESTADOS.length - 1, e = Math.min(p.estado, n);
  return '<div class="cx-resumen-m"><div class="f"><b>' + DICHO[e] + '</b><small>Paso ' + (e + 1) + ' de ' + (n + 1) + '</small></div>' +
    '<div class="cx-barra">' + T.ESTADOS.map(function(_, i){ return '<i class="' + (i < e || e === n ? 'h' : i === e ? 'a' : '') + '"></i>'; }).join('') + '</div>' +
    (ver ? '<a class="cx-ver" href="seguimiento?n=' + encodeURIComponent(p.n) + '">Ver seguimiento completo ' + I.chev.replace('<svg', '<svg width="16" height="16" style="fill:none;stroke:currentColor;stroke-width:1.8;margin-left:6px"') + '</a>' : '') + '</div>';
}
function detalleHTML(p){
  var fin = p.estado >= T.ESTADOS.length - 1;
  var items = p.items.map(function(x){
    var c = x.key && T.CAT[x.key];
    var foto = c && c.img ? '<img src="' + esc(c.img) + '" alt="" loading="lazy" decoding="async">' : '<span>G</span>';
    var op = x.key && fin ? (T.opiniones.mia(x.key) ? '<small> · Opinión en revisión</small>' : ' · <a class="cx-op" href="' + T.url(x.key) + '#opiniones">Opinar</a>') : '';
    return '<li class="cx-it">' + foto + '<div><b>' + (x.key ? '<a href="' + T.url(x.key) + '" style="color:inherit">' + esc(x.nombre) + '</a>' : esc(x.nombre)) + '</b><small>' + x.qty + ' ud.</small>' + op + '</div>' +
      '<em>' + (x.valor === null ? 'A cotizar' : T.fmt(x.valor * x.qty)) + '</em></li>';
  }).join('');
  var entrega = p.entrega && p.entrega.resumen ? p.entrega.resumen : '—', comp = p.comprobante && p.comprobante.resumen ? ocultarDoc(p.comprobante.resumen) : '—';
  var pagar = p.subtotal && !p.pagado && T.db('pasarela') === true ? '<a class="cx-btn" href="pagar?n=' + encodeURIComponent(p.n) + '">' + I.tarjeta + 'Pagar</a>' : '';
  var datosPago = p.pagoKey === 'directo' && !p.pagado ? '<a class="cx-btn" href="checkout?ok=' + encodeURIComponent(p.n) + '">' + I.tarjeta + 'Datos de pago</a>' : '';
  return '<section class="cx-det" aria-label="Detalle del pedido ' + esc(p.n) + '">' +
    '<div class="cx-det-cab"><div><p class="cx-k">Detalle del pedido</p><h2 class="cx-h2">' + esc(p.n) + '</h2></div>' + chip(p) + '</div>' +
    pasos(p) + resumenM(p, true) +
    '<ul class="cx-items">' + items + '</ul>' +
    '<div class="cx-totbox"><span>Total</span><b>' + (p.subtotal ? T.fmt(p.subtotal) : 'A cotizar') + '</b></div>' +
    '<div class="cx-dos"><div><span>Entrega</span><span>' + esc(entrega) + '</span></div><div><span>Comprobante</span><span>' + esc(comp) + '</span></div></div>' +
    '<div class="cx-acc">' + pagar + datosPago +
      '<a class="cx-btn" href="' + T.wa('Hola Giandeco, quiero saber el estado de mi pedido ' + p.n + '.') + '" target="_blank" rel="noopener">' + I.wa + '<span>Consultar<span class="d-only"></span><span class="m-only"> por WhatsApp</span></span></a>' +
      '<div class="dup"><button type="button" class="cx-ghost" data-repetir="' + esc(p.n) + '">' + I.repetir + 'Repetir<span class="d-only"> pedido</span></button>' +
      '<a class="cx-ghost" href="' + T.wa('Hola Giandeco, necesito el comprobante de mi pedido ' + p.n + '.') + '" target="_blank" rel="noopener">' + I.doc + 'Comprobante</a></div>' +
    '</div></section>';
}
function vacio(icono, texto, href, cta){
  return '<div class="cx-vacio"><span>' + icono + '</span><p>' + texto + '</p>' + (href ? '<a class="cx-btn es-chico" href="' + href + '"><span>' + cta + '</span></a>' : '') + '</div>';
}
function pcs(keys){
  return '<div class="cx-pcs">' + keys.map(function(k){ var c = T.CAT[k]; return '<a class="cx-pc" href="' + T.url(k) + '"><img src="' + esc(c.img) + '" alt="' + esc(c.nombre) + '" loading="lazy" decoding="async"><span>' + esc(c.nombre) + '</span><em>' + esc(c.precio) + '</em></a>'; }).join('') + '</div>';
}
function listas(){ return { ped:T.pedidos.lista(), fav:T.favs.lista().filter(function(k){ return T.CAT[k]; }) }; }

/* ==================== PANEL: secciones ==================== */
var ETAPAS = ['Visita técnica', 'Propuesta y render', 'Mobiliario y compras', 'Montaje'];
function bn(icono, t, d, href, cta, ext){
  return '<article class="cx-bn"><span class="ic-c">' + icono.replace('<svg', '<svg class="ic"') + '</span><h3>' + t + '</h3><p>' + d + '</p>' +
    '<a class="cx-go" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + cta + I.flecha + '</a></article>';
}
function bnVacio(txt){ return '<article class="cx-bn es-vacio"><span class="ic-c">' + I.mas.replace('<svg', '<svg class="ic"') + '</span><h3>Su próximo beneficio</h3><p>' + txt + '</p></article>'; }
function fila(icono, t, d, href, ic){
  return '<a class="cx-fila' + (ic ? ' es-ic' : '') + '" href="' + href + '">' + (ic ? '<span class="ic-c">' + icono + '</span>' : icono) + '<div><b>' + t + '</b><span>' + d + '</span></div>' + I.chev + '</a>';
}
function servicio(){
  return '<article class="cx-serv"><span class="ic-c">' + I.agenda + '</span><div><h3 class="cx-h3">Visita técnica</h3><p class="cx-p">Visitamos su espacio, lo medimos y lo analizamos para proponerle qué muebles, iluminación y decoración le convienen.</p></div>' +
    '<div class="cx-datos2"><div><span>Costo</span><b>S/ 100</b></div><div><span>Duración</span><b>1 h a 1 h 30</b></div></div>' +
    '<a class="cx-btn" href="contacto">Agendar visita</a></article>';
}
function proyectoBloque(s){
  return '<section class="cx-proy"><div><p class="cx-k">Su proyecto</p><h2 class="cx-h2">Interiorismo con seguimiento</h2>' +
    '<p class="cx-p">Aún no tiene un proyecto vinculado. Cuando lo tenga, verá aquí cada etapa.</p>' +
    '<div class="cx-acc"><a class="cx-btn es-chico" href="' + T.wa('Hola Giandeco, soy ' + s.nombre + ' y quiero vincular mi proyecto a mi cuenta (' + s.email + ').') + '" target="_blank" rel="noopener">Vincular</a>' +
    '<a class="cx-ghost" href="contacto">Agendar visita</a></div></div>' +
    '<ol class="cx-etapas">' + ETAPAS.map(function(e, i){ return '<li><i>' + (i + 1) + '</i><span>' + e + '</span></li>'; }).join('') + '</ol></section>';
}
function cab(h1, extra, sub){
  return '<div class="cx-cab"><div><p class="cx-k">Mi cuenta</p><h1 class="cx-h1">' + h1 + '</h1>' + (sub ? '<p class="cx-p" style="max-width:640px;font-size:16px">' + sub + '</p>' : '') + '</div>' + (extra || '') + '</div>';
}
function asesor(s){ return T.wa('Hola Giandeco, soy ' + s.nombre + ' y quiero hablar con mi asesor.'); }

var SEC = {
  inicio: function(s){
    var L = listas(), p = L.ped.filter(enCurso)[0] || L.ped[0];
    var curso = p ? '<section class="cx-tarjeta"><div class="cx-curso-cab"><div class="cx-curso-id">' + pila(p) +
        '<div><p class="cx-k">' + (enCurso(p) ? 'Pedido en curso' : 'Último pedido') + '</p><b>' + esc(p.n) + '</b><small>' + fecha(p.fecha) + ' · ' + piezas(p) + ' pieza' + (piezas(p) === 1 ? '' : 's') + '</small></div></div>' +
        '<div class="cx-curso-der"><div class="cx-tot"><small>Total</small><b>' + (p.subtotal ? T.fmt(p.subtotal) : 'A cotizar') + '</b></div><a class="cx-btn" href="#pedidos/' + encodeURIComponent(p.n) + '">Ver detalle</a></div></div>' +
        pasos(p) + resumenM(p, false) + '</section>'
      : vacio(I.pedidos, 'Aún no hay pedidos.', 'catalogo/', 'Ver el catálogo');
    return cab(saludo() + ', ' + esc(nombre1(s)), '<a class="cx-ghost es-asesor" href="' + asesor(s) + '" target="_blank" rel="noopener">' + I.waMsg + 'Hablar con mi asesor</a>') + curso +
      '<section class="cx-sec"><div class="cx-sec-cab"><h2 class="cx-h2">Sus beneficios</h2><a class="cx-ver" href="#beneficios">Ver todos</a></div>' +
        '<div class="cx-bn-grid">' + bn(I.waMsg, 'Su asesor', 'Un asesor del estudio le responde por WhatsApp.', asesor(s), 'Escribir', true) +
          bn(I.escudo, 'Cambios y garantía', 'Las condiciones de cambio y garantía de sus piezas.', 'ayuda/cambios-y-garantia', 'Ver condiciones') +
          bn(I.navidad, 'Navidad 2026', 'Las 26 piezas de la colección, con precio y ficha.', 'catalogo/navidad/', 'Ver colección') +
          bnVacio('Próximamente.') + '</div>' +
        '<div class="cx-filas">' + fila(I.waMsg, 'Su asesor', 'Le responde por WhatsApp', asesor(s)) + fila(I.escudo, 'Cambios y garantía', 'Condiciones de sus piezas', 'ayuda/cambios-y-garantia') + fila(I.navidad, 'Navidad 2026', '26 piezas con precio y ficha', 'catalogo/navidad/') + '</div></section>' +
      '<section class="cx-sec"><h2 class="cx-h2">Servicios</h2>' + servicio() + '</section>' +
      (L.fav.length ? '<section class="cx-sec"><div class="cx-sec-cab"><h2 class="cx-h2">Guardados</h2><a class="cx-ver" href="#guardados">Ver los ' + L.fav.length + '</a></div>' + pcs(L.fav.slice(0, 4)) + '</section>' : '');
  },
  pedidos: function(s, ruta){
    var L = listas(), todos = L.ped, filtro = estado.filtro;
    var lista = todos.filter(function(p){ return filtro === 'curso' ? enCurso(p) : filtro === 'entregados' ? !enCurso(p) : true; });
    var nCurso = todos.filter(enCurso).length;
    var sel = (ruta.n && T.pedidos.get(ruta.n)) || lista[0] || todos[0];
    var seg = '<div class="cx-seg es-3" style="grid-template-columns:repeat(3,auto)" role="group" aria-label="Filtrar pedidos">' +
      [['todos', 'Todos · ' + todos.length], ['curso', 'En curso · ' + nCurso], ['entregados', 'Entregados · ' + (todos.length - nCurso)]].map(function(f){
        return '<button type="button" data-filtro="' + f[0] + '" class="' + (filtro === f[0] ? 'is-on' : '') + '" style="padding:0 18px">' + f[1] + '</button>'; }).join('') + '</div>';
    if(!todos.length) return cab('Pedidos') + vacio(I.pedidos, 'Aún no hay pedidos.', 'catalogo/', 'Ver el catálogo');
    return '<div class="cx-ped-cab' + (ruta.n ? ' es-detalle' : '') + '"><div style="display:flex;flex-direction:column;gap:10px"><p class="cx-k">Mi cuenta</p><h1 class="cx-h1"><span class="d-only">Pedidos</span><span class="m-only">' + (ruta.n ? 'Pedido' : 'Pedidos') + '</span></h1></div>' + seg + '</div>' +
      '<div class="cx-ped-grid' + (ruta.n ? ' es-detalle' : '') + '"><div class="cx-ped-lista">' + (lista.length ? lista.map(function(p){
        return '<a class="cx-ped-c' + (sel && p.n === sel.n ? ' on' : '') + '" href="#pedidos/' + encodeURIComponent(p.n) + '"><div class="f1"><b>' + esc(p.n) + '</b>' + chip(p) + '</div>' +
          '<div class="f2">' + pila(p) + '<span>' + fecha(p.fecha, true) + ' · ' + piezas(p) + ' pieza' + (piezas(p) === 1 ? '' : 's') + '</span></div><strong>' + (p.subtotal ? T.fmt(p.subtotal) : 'A cotizar') + '</strong></a>'; }).join('')
        : '<p class="cx-p">No hay pedidos en esta vista.</p>') + '</div>' + (sel ? detalleHTML(sel) : '') + '</div>';
  },
  proyectos: function(s){
    var n = ''; for(var i = 0; i <= 10; i++) n += '<input type="radio" name="tsNps" id="tsNps' + i + '" value="' + i + '"><label for="tsNps' + i + '">' + i + '</label>';
    function ta(id, label, err){ return '<div class="cx-campo"><label class="cx-lb" for="' + id + '">' + label + '</label><textarea id="' + id + '"></textarea><span class="cx-err">' + err + '</span></div>'; }
    return cab('Proyectos', '', 'Etapas, visitas y documentos de su interiorismo.') + proyectoBloque(s) +
      '<details class="cx-plegable"><summary>Dejar mi testimonio</summary><form id="tsForm" novalidate>' +
        '<div class="cx-dos-c">' + campo('tsProy', 'Proyecto', 'text', '', 'Indique qué proyecto fue.') + campo('tsRol', 'Cargo y empresa (opcional)', 'text', '', '') + '</div>' +
        ta('tsAntes', '¿Qué necesitaba resolver?', 'Una o dos líneas.') + ta('tsDespues', '¿Qué cambió después?', 'Una o dos líneas.') +
        '<div class="cx-campo"><span class="cx-lb">¿Nos recomendaría? 0 a 10</span><div class="cx-nps">' + n + '</div><span class="cx-err">Elija un número.</span></div>' +
        '<label class="cx-check"><input type="checkbox" id="tsPub"><span><b style="font-size:15px">Autorizo publicarlo con mi nombre y mi marca.</b></span></label>' +
        '<div><button type="submit" class="cx-btn es-chico"><span>Enviar por WhatsApp</span></button></div></form></details>';
  },
  guardados: function(){
    var fav = listas().fav;
    return cab('Guardados', '', 'Sus piezas favoritas, listas para pedir.') + (fav.length ? pcs(fav) : vacio(I.guardados, 'Aún no guarda piezas.', 'catalogo/', 'Ver el catálogo'));
  },
  beneficios: function(s){
    return cab('Beneficios', '', 'Lo que Giandeco pone a disposición de sus clientes.') +
      '<div class="cx-bn-grid es-3">' + bn(I.waMsg, 'Su asesor', 'Un asesor del estudio resuelve sus dudas por WhatsApp.', asesor(s), 'Escribir', true) +
        bn(I.navidad, 'Colección Navidad 2026', 'Las 26 piezas de la colección, con precio y ficha.', 'catalogo/navidad/', 'Ver colección') +
        bn(I.escudo, 'Cambios y garantía', 'Conozca las condiciones de cambio y garantía de sus piezas.', 'ayuda/cambios-y-garantia', 'Ver condiciones') +
        bn(I.envio, 'Envíos y entregas', 'Plazos, cobertura y cómo recibir su pedido.', 'ayuda/envios-y-entregas', 'Ver detalles') +
        bnVacio('Próximamente.') + '</div>' +
      '<div class="cx-filas">' + fila(I.waMsg, 'Su asesor', 'Le responde por WhatsApp', asesor(s)) + fila(I.navidad, 'Colección Navidad 2026', '26 piezas con precio y ficha', 'catalogo/navidad/') +
        fila(I.escudo, 'Cambios y garantía', 'Condiciones de sus piezas', 'ayuda/cambios-y-garantia') + fila(I.envio, 'Envíos y entregas', 'Plazos y cobertura', 'ayuda/envios-y-entregas') + '</div>' +
      '<section class="cx-sec"><div style="display:flex;flex-direction:column;gap:6px"><h2 class="cx-h2">Servicios</h2><p class="cx-p">Servicios del estudio con costo, aparte de sus beneficios.</p></div>' + servicio() + '</section>' +
      proyectoBloque(s);
  },
  direcciones: function(s){
    var d = T.db('datos') || {}, comp = d.comp === 'factura' ? 'Factura · RUC ' + esc(d.ruc || '') + (d.razon ? ' · ' + esc(d.razon) : '') : d.doc ? 'Boleta · ' + esc(d.tdoc || 'DNI') + ' ' + esc(ocultarDoc(d.doc)) : '';
    var dir = d.dir ? esc(d.dir) + (d.ref ? ' · ' + esc(d.ref) : '') : '';
    return cab('Direcciones y facturación', '', 'Lo que usamos para entregar y emitir su comprobante. Se guarda al comprar y aquí lo puede corregir.') +
      '<div class="cx-datos-grid"><div class="cx-col"><section class="cx-cd"><h2>Entrega</h2>' +
        '<div class="cx-rw"><span class="ic-c">' + I.direcciones + '</span><div><b>Dirección de entrega</b><span class="d">' + (dir || 'Aún no hay una dirección guardada.') + '</span></div><button type="button" class="cx-ed" data-editar="dir">Editar</button></div>' +
        '<form class="cx-edit" id="cuDir" data-panel="dir" novalidate>' + campo('cuDirTxt', 'Dirección', 'text', 'autocomplete="street-address" value="' + esc(d.dir || '') + '" placeholder="Avenida, calle o jirón, número, dpto. o interior"', 'Indique la dirección de entrega.') +
          campo('cuRef', 'Referencia', 'text', 'value="' + esc(d.ref || '') + '" placeholder="Frente al parque, a una cuadra de…"', '') +
          '<p class="cx-legal2">El distrito se elige al comprar.</p><div class="cx-acc"><button type="submit" class="cx-btn es-chico">Guardar</button><span class="cx-ok" role="status" hidden>' + I.check + 'Guardado</span></div></form></section></div>' +
      '<div class="cx-col"><section class="cx-cd"><h2>Comprobante</h2>' +
        '<div class="cx-rw"><span class="ic-c">' + I.doc + '</span><div><b>Comprobante</b><span class="d">' + (comp || 'Aún no hay datos de comprobante.') + '</span></div><button type="button" class="cx-ed" data-editar="comp">Editar</button></div>' +
        '<form class="cx-edit" id="cuComp" data-panel="comp" novalidate>' +
          '<div class="cx-radios"><label><input type="radio" name="cuTipo" value="boleta"' + (d.comp !== 'factura' ? ' checked' : '') + '> Boleta</label><label><input type="radio" name="cuTipo" value="factura"' + (d.comp === 'factura' ? ' checked' : '') + '> Factura · RUC</label></div>' +
          '<div data-bol' + (d.comp === 'factura' ? ' hidden' : '') + ' style="display:flex;flex-direction:column;gap:16px"><div class="cx-campo"><label class="cx-lb" for="cuTdoc">Tipo de documento</label><div class="cx-sel"><select class="cx-in" id="cuTdoc">' +
            ['DNI', 'Carné de extranjería', 'Pasaporte'].map(function(o){ return '<option' + (o === d.tdoc ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>' + I.abajo + '</div></div>' +
            campo('cuDoc', 'Número de documento', 'text', 'maxlength="12" autocomplete="off" value="' + esc(d.doc || '') + '"', 'Revise el número: el DNI tiene 8 dígitos.') + '</div>' +
          '<div data-fac' + (d.comp === 'factura' ? '' : ' hidden') + ' style="display:flex;flex-direction:column;gap:16px">' +
            campo('cuRuc', 'RUC', 'text', 'inputmode="numeric" maxlength="11" value="' + esc(d.ruc || '') + '"', 'El RUC tiene 11 dígitos y empieza en 10 o 20.') +
            campo('cuRazon', 'Razón social', 'text', 'autocomplete="organization" value="' + esc(d.razon || '') + '"', 'Indique la razón social.') + '</div>' +
          '<div class="cx-acc"><button type="submit" class="cx-btn es-chico">Guardar</button><span class="cx-ok" role="status" hidden>' + I.check + 'Guardado</span></div></form></section></div></div>';
  },
  datos: function(s){
    var conCuenta = !!A.actual(), google = s.proveedor === 'google', d = T.db('datos') || {};
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.nac || ''), ed = edadDe(s.nac), com = s.com || {};
    function sel(id, etiqueta, ops, val, vacio){
      return '<div class="cx-sel"><select class="cx-in es-sel" id="' + id + '" aria-label="' + etiqueta + '"><option value="">' + vacio + '</option>' + ops.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' + I.abajo + '</div>';
    }
    var dias = [], anios = [], a0 = new Date().getFullYear(), i;
    for(i = 1; i <= 31; i++) dias.push([i, i]);
    for(i = a0 - 13; i >= a0 - 100; i--) anios.push([i, i]);
    var meses = MESES.map(function(x, k){ return [k + 1, x]; });
    var canal = com.canal || 'whatsapp';
    var entrega = d.dir ? esc(d.dir) : 'Aún no hay una dirección guardada.';
    var compt = d.comp === 'factura' ? 'Factura · RUC ' + esc(d.ruc || '') : d.doc ? 'Boleta · ' + esc(d.tdoc || 'DNI') + ' ' + esc(ocultarDoc(d.doc)) : 'Aún no hay datos de comprobante.';
    return cab('<span class="d-only">Mis datos y seguridad</span><span class="m-only">' + (estado.sec === 'seguridad' ? 'Seguridad' : 'Mis datos') + '</span>') +
      '<div class="cx-datos-grid"><div class="cx-col">' +
        '<section class="cx-cd cx-perfil"><h2>Perfil</h2><form class="cx-form2" id="cuDatos" novalidate>' +
          '<div class="cx-campo"><label class="cx-lb" for="cuNombre">Nombre y apellido</label><input class="cx-in" id="cuNombre" type="text" autocomplete="name" value="' + esc(s.nombre || '') + '"><span class="cx-err">Indique su nombre.</span></div>' +
          '<div class="cx-dos-c"><div class="cx-campo"><label class="cx-lb" for="cuCel">Celular</label><input class="cx-in" id="cuCel" type="tel" inputmode="numeric" maxlength="9" autocomplete="tel-national" value="' + esc(s.cel || '') + '"><span class="cx-err">Celular de 9 dígitos que empiece en 9.</span></div>' +
            '<div class="cx-campo"><label class="cx-lb" for="cuEmail">Correo</label><div class="cx-ctl"><input class="cx-in" id="cuEmail" type="email" autocomplete="email" value="' + esc(s.email || '') + '"' + (conCuenta ? ' readonly' : '') + '>' + (conCuenta ? I.candado : '') + '</div><span class="cx-err">Revise el correo.</span></div></div>' +
          '<div><span class="cx-lb">Fecha de nacimiento</span><div class="cx-nac">' + sel('cuDia', 'Día', dias, m ? +m[3] : '', 'Día') + sel('cuMes', 'Mes', meses, m ? +m[2] : '', 'Mes') + sel('cuAnio', 'Año', anios, m ? +m[1] : '', 'Año') + '</div>' +
            '<span class="cx-pista">Para enviarle su cupón de cumpleaños' + (ed !== null ? ' · ' + ed + ' años' : '') + '.</span></div>' +
          '<div class="cx-dos-c"><div><span class="cx-lb">Género · opcional</span>' + sel('cuGen', 'Género', [['f', 'Femenino'], ['m', 'Masculino'], ['o', 'Otro'], ['n', 'Prefiero no decirlo']], s.genero || '', 'Elegir') + '</div>' +
            '<div class="cx-edad-w"><span class="cx-lb">Edad</span><div class="cx-edad" id="cuEdad">' + (ed !== null ? ed + ' años' : '—') + '</div></div></div>' +
          '<div class="cx-acc"><button type="submit" class="cx-btn es-chico">Guardar</button><span class="cx-ok" id="cuOk" role="status" hidden>' + I.check + 'Guardado</span></div></form></section>' +
        '<section class="cx-cd cx-solo-d"><h2>Entrega y comprobante</h2>' +
          '<div class="cx-rw"><span class="ic-c">' + I.direcciones + '</span><div><b>Dirección de entrega</b><span class="d">' + entrega + '</span></div><a class="cx-ed" href="#direcciones">Editar</a></div>' +
          '<div class="cx-rw"><span class="ic-c">' + I.doc + '</span><div><b>Comprobante</b><span class="d">' + compt + '</span></div><a class="cx-ed" href="#direcciones">Editar</a></div></section>' +
      '</div><div class="cx-col">' +
        '<section class="cx-cd cx-acceso"><h2>Acceso y seguridad</h2>' +
          '<div class="cx-rw"><span class="ic-c">' + (google ? GOOGLE.replace('<svg', '<svg class="g"') : I.correo) + '</span><div><b>' + (google ? 'Entra con Google' : 'Entra con correo y clave') + '</b><span class="d">' + esc(s.email || '') + '</span></div><span class="cx-chip es-oro">' + I.check + 'Conectado</span></div>' +
          '<div class="cx-rw"><span class="ic-c">' + I.escudo + '</span><div><b>Clave</b><span class="d">' + (google ? 'No la necesita: su cuenta está protegida por Google.' : 'Le enviamos un enlace a su correo para cambiarla.') + '</span></div>' + (google ? '<span></span>' : '<button type="button" class="cx-ed" id="cuClave">Cambiar</button>') + '</div></section>' +
        '<section class="cx-cd cx-com"><h2>Comunicación y cupones</h2>' +
          '<label class="cx-check"><input type="checkbox" id="comCumple"' + (com.cumple !== false ? ' checked' : '') + '><span><b>Cupón de cumpleaños</b><small>Reciba su cupón en el mes de su cumpleaños.</small></span></label>' +
          '<label class="cx-check"><input type="checkbox" id="comNovedades"' + (com.novedades !== false ? ' checked' : '') + '><span><b>Novedades y colecciones</b><small>Lanzamientos, Navidad y ofertas para clientes.</small></span></label>' +
          '<label class="cx-check"><input type="checkbox" checked disabled><span><b>Avisos de sus pedidos</b><small>Estado, envío y entrega. Siempre activos.</small></span></label>' +
          '<div><span class="cx-lb">Cómo prefiere que le escribamos</span><div class="cx-seg es-3" id="comCanal" role="group">' +
            [['whatsapp', 'WhatsApp'], ['correo', 'Correo'], ['ambos', 'Ambos']].map(function(c){ return '<button type="button" data-canal="' + c[0] + '" class="' + (canal === c[0] ? 'is-on' : '') + '">' + c[1] + '</button>'; }).join('') + '</div></div>' +
          '<p class="cx-legal2">Usamos su fecha de nacimiento solo para su cupón y para comunicarnos con usted. Puede cambiarlo cuando quiera. <a href="legal/politica-de-privacidad">Privacidad</a></p></section>' +
      '</div></div>' +
      '<div class="cx-acc cx-pie-d"><button type="button" class="cx-ghost" id="cuSalir">' + I.salir + 'Cerrar sesión</button><button type="button" class="cx-ghost es-peligro" id="cuBorrar">Borrar datos de este dispositivo</button></div>';
  },
  cuenta: function(s){
    var conCuenta = !!A.actual(), google = s.proveedor === 'google';
    return '<div class="cx-cuenta-m"><div class="cx-yo"><span class="cx-avatar">' + (s.foto ? '<img src="' + esc(s.foto) + '" alt="" referrerpolicy="no-referrer">' : iniciales(s.nombre)) + '</span>' +
      '<div><b>' + esc(s.nombre || '') + '</b>' + (conCuenta ? '<span class="cx-ver-cta">' + I.escudo + 'Cuenta verificada</span>' : '') + '</div></div>' +
      '<div class="cx-filas" style="display:flex">' + fila(I.datos, 'Mis datos', 'Nombre, cumpleaños y comunicación', '#datos', true) + fila(I.direcciones, 'Direcciones y facturación', 'Entrega y comprobante', '#direcciones', true) +
        fila(I.beneficios, 'Beneficios', 'Asesor, Navidad y más', '#beneficios', true) + fila(I.escudo, 'Seguridad', (google ? 'Entra con Google' : 'Entra con correo') + ' · Conectado', '#seguridad', true) +
        fila(I.ayuda, 'Ayuda y postventa', 'Cambios, garantía y reclamos', 'ayuda/cambios-y-garantia', true) + '</div>' +
      '<div class="cx-cuenta-pie"><button type="button" class="cx-ghost" id="cuSalir">' + I.salir + 'Cerrar sesión</button><button type="button" class="cx-borrar" id="cuBorrar">Borrar los datos de este dispositivo</button></div></div>';
  }
};

/* ---------- rutas y estructura ---------- */
var estado = { filtro:'todos', sec:'inicio' };
var ALIAS = { '': 'inicio', resumen:'inicio', favoritos:'guardados', pedido:'pedidos' };
var NAV = [['inicio', 'Inicio'], ['pedidos', 'Pedidos'], ['proyectos', 'Proyectos'], ['guardados', 'Guardados'], ['beneficios', 'Beneficios'], ['direcciones', 'Direcciones y facturación'], ['datos', 'Mis datos y seguridad']];
var MOVIL = [['inicio', 'Inicio'], ['pedidos', 'Pedidos'], ['proyectos', 'Proyectos'], ['guardados', 'Guardados'], ['cuenta', 'Cuenta']];
function ruta(){
  var h = (location.hash || '').replace(/^#/, ''), p = h.split('/'), sec = ALIAS[p[0]] !== undefined ? ALIAS[p[0]] : p[0];
  if(!SEC[sec] && sec !== 'seguridad') sec = 'inicio';
  return { sec:sec, n:p[1] ? decodeURIComponent(p[1]) : '' };
}
function secMovil(sec){ return { inicio:'inicio', pedidos:'pedidos', proyectos:'proyectos', guardados:'guardados' }[sec] || 'cuenta'; }

function panel(s, nota){
  document.body.classList.remove('cx-auth-b');
  var r = ruta(), sec = r.sec;
  estado.sec = sec;
  var L = listas(), conCuenta = !!A.actual();
  /* en escritorio «cuenta» y «seguridad» se ven dentro de «Mis datos y seguridad» */
  var esc1 = window.innerWidth > 899, secD = sec === 'cuenta' ? 'datos' : sec === 'seguridad' ? 'datos' : sec;
  var contenido = (sec === 'cuenta' && !esc1) ? SEC.cuenta(s) : (sec === 'seguridad' ? SEC.datos(s) : SEC[secD](s, r));
  if(sec === 'cuenta' && !esc1) secD = 'cuenta';
  var navD = sec === 'cuenta' || sec === 'seguridad' ? 'datos' : sec;
  var atras = (sec === 'pedidos' && r.n) ? ['#pedidos', 'Pedidos'] : (['beneficios', 'direcciones', 'datos', 'seguridad'].indexOf(sec) !== -1 ? ['#cuenta', 'Cuenta'] : null);
  var mhead = atras
    ? '<header class="cx-mhead es-atras"><a class="cx-back" href="' + atras[0] + '" aria-label="Volver a ' + atras[1].toLowerCase() + '">' + I.atras + '</a><span class="cx-back-t">' + atras[1] + '</span></header>'
    : '<header class="cx-mhead"><a href="./" aria-label="Giandeco Studio Design"><img src="img/logo-dorado.svg" alt="Giandeco Studio Design" width="300" height="268"></a><a class="cx-aser" href="' + asesor(s) + '" target="_blank" rel="noopener" aria-label="Hablar con mi asesor">' + I.waMsg + '</a></header>';
  var cuentas = { pedidos:L.ped.length, guardados:L.fav.length };
  root.innerHTML = '<div class="cx-app" data-sec="' + sec + '">' + mhead +
    '<aside class="cx-side"><div class="cx-yo"><span class="cx-avatar">' + (s.foto ? '<img src="' + esc(s.foto) + '" alt="" referrerpolicy="no-referrer">' : iniciales(s.nombre)) + '</span>' +
      '<div><b>' + esc(s.nombre || '') + '</b>' + (conCuenta ? '<span class="cx-ver-cta">' + I.escudo + 'Cuenta verificada</span>' : '') + '</div></div>' +
      '<nav class="cx-nav" aria-label="Secciones de la cuenta">' + NAV.map(function(t){
        return '<a class="cx-nv' + (t[0] === navD ? ' on' : '') + '" href="#' + t[0] + '"' + (t[0] === navD ? ' aria-current="page"' : '') + '>' + I[t[0]] + t[1] + (cuentas[t[0]] ? '<b>' + cuentas[t[0]] + '</b>' : '') + '</a>'; }).join('') + '</nav>' +
      '<div class="cx-side-pie"><button type="button" class="cx-nv" id="cuSalir2">' + I.salir + 'Cerrar sesión</button></div></aside>' +
    '<main class="cx-main" id="cxMain">' + (nota ? '<p class="cx-nota" role="status">' + esc(nota) + '</p>' : '') + contenido + '</main>' +
    '<nav class="cx-tabbar" aria-label="Secciones de la cuenta">' + MOVIL.map(function(t){
      var on = secMovil(sec) === t[0];
      return '<a class="cx-tb' + (on ? ' on' : '') + '" href="#' + t[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + (t[0] === 'cuenta' ? I.datos : I[t[0]]) + t[1] + (cuentas[t[0]] ? '<i>' + cuentas[t[0]] + '</i>' : '') + '</a>'; }).join('') + '</nav></div>';
}

/* compró como invitado: sin «Hola», solo sus pedidos y un botón para activar la cuenta */
function invitado(s, nota){
  document.body.classList.remove('cx-auth-b');
  var ped = T.pedidos.lista();
  root.innerHTML = '<div class="cx-invitado"><div class="cx-cab"><div><p class="cx-k">Sus pedidos</p><h1 class="cx-h1">Su compra</h1></div></div>' +
    (nota ? '<p class="cx-nota" role="status">' + esc(nota) + '</p>' : '') +
    '<div class="cx-activar"><span>' + I.escudo + '</span><div><b>Active su cuenta</b><small>Con el mismo correo (' + esc(s.email || '') + ') verá sus pedidos en cualquier dispositivo.</small></div>' +
      '<button type="button" class="cx-btn" data-activar>Activar mi cuenta</button></div>' +
    (ped.length ? ped.map(detalleHTML).join('') : vacio(I.pedidos, 'Aún no hay pedidos.', 'catalogo/', 'Ver el catálogo')) +
    '<div class="cx-acc"><button type="button" class="cx-ghost" data-v="entrar">Ya tengo una cuenta</button><button type="button" class="cx-ghost es-peligro" id="cuBorrar">Borrar datos de este dispositivo</button></div></div>';
}

function pintar(nota){
  var s = T.sesion.get();
  if(!s){ acceso(); return; }
  if(A.actual()) panel(s, nota); else invitado(s, nota);
}

/* ---------- eventos ---------- */
function guardarSesion(cambios){
  var s = T.sesion.get() || {}; Object.keys(cambios).forEach(function(k){ s[k] = cambios[k]; }); T.sesion.set(s);
  if(A.actual()){ var md = {}; ['nombre', 'cel', 'nac', 'genero', 'com'].forEach(function(k){ if(k in cambios) md[k] = cambios[k]; }); if(cambios.nombre) md.full_name = cambios.nombre; A.actualizar(md); }
  return s;
}
function mostrarOk(el){ if(el){ el.hidden = false; setTimeout(function(){ el.hidden = true; }, 2600); } }

root.addEventListener('click', function(e){
  var t = e.target;
  var v = t.closest('[data-v]'); if(v){ e.preventDefault(); var s0 = T.sesion.get(); if(s0 && !A.actual()){ vista = v.getAttribute('data-v'); acceso(); } else irA(v.getAttribute('data-v')); return; }
  if(t.closest('[data-activar]')){ var si = T.sesion.get() || {}; vista = 'crear'; acceso(); var n = document.getElementById('cxNombre'), c = document.getElementById('cxCorreo'); if(n) n.value = si.nombre || ''; if(c) c.value = si.email || ''; var k = document.getElementById('cxClave'); if(k) k.focus(); return; }
  if(t.closest('#cxGoogle')){
    var gb = t.closest('#cxGoogle'); gb.disabled = true;
    A.google().then(function(r){ gb.disabled = false; if(r && !r.ok){ if(document.getElementById('cxMsg')) error(r.error); else pintar(r.error); } });
    return;
  }
  var ojo = t.closest('[data-ojo]');
  if(ojo){ var inp = document.getElementById(ojo.getAttribute('data-ojo')), ver = inp.type === 'password'; inp.type = ver ? 'text' : 'password';
    ojo.innerHTML = ver ? I.ojoNo : I.ojo; ojo.setAttribute('aria-label', ver ? 'Ocultar la clave' : 'Mostrar la clave'); return; }
  var fl = t.closest('[data-filtro]'); if(fl){ estado.filtro = fl.getAttribute('data-filtro'); pintar(); return; }
  var ed = t.closest('[data-editar]'); if(ed){ var fm = root.querySelector('[data-panel="' + ed.getAttribute('data-editar') + '"]'); if(fm){ fm.classList.toggle('es-abierto'); var i1 = fm.querySelector('input:not([type=radio])'); if(i1 && fm.classList.contains('es-abierto')) i1.focus(); } return; }
  var cn = t.closest('[data-canal]'); if(cn){ var com = (T.sesion.get() || {}).com || {}; com.canal = cn.getAttribute('data-canal'); guardarSesion({ com:com });
    root.querySelectorAll('[data-canal]').forEach(function(b){ b.classList.toggle('is-on', b === cn); }); return; }
  var r = t.closest('[data-repetir]');
  if(r){ var p = T.pedidos.get(r.getAttribute('data-repetir'));
    p.items.forEach(function(x){ if(x.key) T.carrito.addKey(x.key, x.qty); else T.carrito.addEspacio(x.nombre, x.cat, x.origen); });
    T.abrir(); return; }
  if(t.closest('#cuSalir, #cuSalir2')){ A.salir(); location.hash = ''; vista = 'entrar'; pintar(); window.scrollTo(0, 0); return; }
  if(t.closest('#cuClave')){ var s1 = T.sesion.get(); A.recuperar(s1.email).then(function(x){ pintar(x.ok ? 'Le enviamos un enlace a ' + s1.email + ' para cambiar su clave.' : x.error); }); return; }
  if(t.closest('#cuBorrar') && window.confirm('Se borrarán su sesión, pedidos, guardados y bolsa de este dispositivo. ¿Continuar?')){
    A.salir();
    ['sesion', 'pedidos', 'favs', 'vistos', 'datos', 'opiniones', 'carrito', 'reclamos', 'preguntas', 'testimonios'].forEach(function(k){ T.db(k, null); });
    location.href = 'cuenta';
  }
});
root.addEventListener('input', function(e){
  var c = e.target.closest('.cx-campo'); if(c){ c.classList.remove('is-mal'); var msg = document.getElementById('cxMsg'); if(msg && !root.querySelector('.cx-campo.is-mal')) msg.hidden = true; }
  if(e.target.id === 'cxClave'){ var m = root.querySelector('.cx-fuerza'); if(m) m.setAttribute('data-n', e.target.value ? fuerza(e.target.value) : 0); }
});
root.addEventListener('change', function(e){
  var id = e.target.id;
  if(id === 'comCumple' || id === 'comNovedades'){
    var com = (T.sesion.get() || {}).com || {}; com.cumple = document.getElementById('comCumple').checked; com.novedades = document.getElementById('comNovedades').checked; guardarSesion({ com:com }); return;
  }
  if(id === 'cuDia' || id === 'cuMes' || id === 'cuAnio'){
    var d = +document.getElementById('cuDia').value, m = +document.getElementById('cuMes').value, a = +document.getElementById('cuAnio').value, el = document.getElementById('cuEdad');
    var ed = d && m && a ? edadDe(a + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2)) : null; if(el) el.textContent = ed !== null ? ed + ' años' : '—'; return;
  }
  if(e.target.name === 'cuTipo'){ var fac = e.target.value === 'factura'; var fm = e.target.closest('form'); fm.querySelector('[data-bol]').hidden = fac; fm.querySelector('[data-fac]').hidden = !fac; }
});
root.addEventListener('submit', function(e){
  e.preventDefault();
  var fm = e.target;
  if(fm.id === 'cxForm'){ enviarAcceso(); return; }
  if(fm.id === 'cuDatos'){
    var n = fm.querySelector('#cuNombre'), c = fm.querySelector('#cuCel'), m = fm.querySelector('#cuEmail');
    var ok = [[n, n.value.trim().length > 2], [c, !c.value.trim() || /^9\d{8}$/.test(c.value.trim())], [m, correoOk(m.value.trim())]];
    ok.forEach(function(x){ x[0].closest('.cx-campo').classList.toggle('is-mal', !x[1]); });
    if(ok.some(function(x){ return !x[1]; })) return;
    var d = +fm.querySelector('#cuDia').value, mes = +fm.querySelector('#cuMes').value, a = +fm.querySelector('#cuAnio').value;
    var nac = d && mes && a ? a + '-' + ('0' + mes).slice(-2) + '-' + ('0' + d).slice(-2) : '';
    if(nac && edadDe(nac) === null){ fm.querySelector('#cuDia').focus(); return; }
    guardarSesion({ nombre:n.value.trim(), cel:c.value.trim(), email:m.value.trim(), nac:nac, genero:fm.querySelector('#cuGen').value });
    mostrarOk(document.getElementById('cuOk'));
    return;
  }
  if(fm.id === 'cuDir'){
    var dir = fm.querySelector('#cuDirTxt'); if(dir.value.trim().length < 6){ dir.closest('.cx-campo').classList.add('is-mal'); return; }
    var dt = T.db('datos') || {}; dt.dir = dir.value.trim(); dt.ref = fm.querySelector('#cuRef').value.trim(); T.db('datos', dt);
    mostrarOk(fm.querySelector('.cx-ok')); setTimeout(function(){ pintar(); }, 700); return;
  }
  if(fm.id === 'cuComp'){
    var tipo = fm.querySelector('input[name="cuTipo"]:checked').value, dt2 = T.db('datos') || {}, bad = false;
    if(tipo === 'factura'){
      var ruc = fm.querySelector('#cuRuc'), raz = fm.querySelector('#cuRazon');
      var r1 = /^(10|20)\d{9}$/.test(ruc.value.trim()), r2 = raz.value.trim().length > 2;
      ruc.closest('.cx-campo').classList.toggle('is-mal', !r1); raz.closest('.cx-campo').classList.toggle('is-mal', !r2); bad = !(r1 && r2);
      if(!bad){ dt2.comp = 'factura'; dt2.ruc = ruc.value.trim(); dt2.razon = raz.value.trim(); }
    } else {
      var doc = fm.querySelector('#cuDoc'), td = fm.querySelector('#cuTdoc').value, v = doc.value.trim();
      var okd = td === 'DNI' ? /^\d{8}$/.test(v) : v.length >= 6;
      doc.closest('.cx-campo').classList.toggle('is-mal', !okd); bad = !okd;
      if(!bad){ dt2.comp = 'boleta'; dt2.tdoc = td; dt2.doc = v; }
    }
    if(bad) return;
    T.db('datos', dt2); mostrarOk(fm.querySelector('.cx-ok')); setTimeout(function(){ pintar(); }, 700); return;
  }
  if(fm.id === 'tsForm'){
    var g = function(id){ return fm.querySelector('#' + id); }, nps = fm.querySelector('input[name="tsNps"]:checked');
    var rr = [[g('tsProy'), g('tsProy').value.trim().length > 2], [g('tsAntes'), g('tsAntes').value.trim().length > 10], [g('tsDespues'), g('tsDespues').value.trim().length > 10]];
    rr.forEach(function(x){ x[0].closest('.cx-campo').classList.toggle('is-mal', !x[1]); });
    fm.querySelector('.cx-nps').closest('.cx-campo').classList.toggle('is-mal', !nps);
    var mal = fm.querySelector('.is-mal input, .is-mal textarea'); if(mal){ mal.focus(); return; }
    var se = T.sesion.get(), rol = g('tsRol').value.trim();
    var ts, tss = T.db('testimonios') || []; tss.unshift(ts = { id:T.uid(), autor:se.nombre, rol:rol, proyecto:g('tsProy').value.trim(), antes:g('tsAntes').value.trim(), despues:g('tsDespues').value.trim(), nps:+nps.value, publicar:g('tsPub').checked, fecha:new Date().toISOString() });
    T.db('testimonios', tss); T.nube('testimonios', ts.id, ts);
    window.open(T.wa('Hola Giandeco, dejo mi testimonio del proyecto ' + ts.proyecto + '.\n\nQué necesitaba resolver: ' + ts.antes + '\n\nQué cambió después: ' + ts.despues +
      '\n\nRecomendación: ' + ts.nps + '/10\n' + se.nombre + (rol ? ' · ' + rol : '') + '\n' + (ts.publicar ? 'Autorizo publicarlo con mi nombre y el de mi marca o proyecto.' : 'Prefiero que no se publique.')), '_blank', 'noopener');
  }
});
window.addEventListener('hashchange', function(){ if(T.sesion.get() && A.actual()){ pintar(); window.scrollTo(0, 0); } });
document.addEventListener('gd:favs', function(){ if(/^#(guardados|favoritos)/.test(location.hash) || !location.hash) pintar(); });
var ancho = window.innerWidth > 899;
window.addEventListener('resize', function(){ var a = window.innerWidth > 899; if(a !== ancho){ ancho = a; if(T.sesion.get() && A.actual()) pintar(); } });

/* ---------- arranque ---------- */
root.innerHTML = '<div class="cx-cargando" role="status" aria-label="Cargando su cuenta"><i></i></div>';
A.iniciar().then(function(r){
  if(r && r.error){ vista = 'entrar'; aviso = r.error; acceso(); return; }
  if(r && r.tipo === 'recovery'){ vista = 'nueva'; acceso(); return; }
  pintar(r && r.tipo === 'signup' ? 'Cuenta activada. Bienvenido.' : null);
  T.pedidos.sincronizar(function(){ pintar(); });
});
})();
