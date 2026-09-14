/* ==========================================================================
   GIANDECO — CAPA COMPARTIDA
   Un solo archivo gobierna el mapa del sitio, el header, el footer y las
   interacciones de todas las páginas. Cada página declara dónde está con
   <body data-mundo="retail" data-seccion="proyectos"> y el header se
   marca solo. Añadir una sección = una línea en SITIO.
   ========================================================================== */
(function(){
'use strict';

/* --------------------------------------------------------------------------
   1. MAPA DEL SITIO
   -------------------------------------------------------------------------- */
var SITIO = {
  retail: {
    label:'Retail', home:'retail.html',
    secciones:[
      { key:'home',      label:'Retail',              href:'retail.html' },
      { key:'diseno',    label:'Diseño de tiendas',   href:'retail-diseno-tiendas.html' },
      { key:'proyectos', label:'Proyectos',           href:'retail-proyectos.html' },
      { key:'blog',      label:'Blog',                href:'retail-blog.html' }
    ]
  },
  hogar: {
    label:'Hogar', home:'hogar.html',
    secciones:[
      { key:'home',      label:'Hogar',                 href:'hogar.html' },
      { key:'diseno',    label:'Diseño de interiores',  href:'hogar-diseno-interiores.html' },
      { key:'espacios',  label:'Espacios',              href:'hogar-espacios.html' },
      { key:'proyectos', label:'Proyectos',             href:'hogar-proyectos.html' },
      { key:'blog',      label:'Blog',                  href:'hogar-blog.html' }
    ]
  },
  catalogo: {
    label:'Catálogo', home:'catalogo.html',
    secciones:[
      { key:'home',     label:'Catálogo',           href:'catalogo.html' },
      { key:'navidad',  label:'Navidad',            href:'catalogo-navidad.html' },
      { key:'muebleria',label:'Mueblería',          href:'catalogo-muebleria.html' },
      { key:'espacio',  label:'Compra el espacio',  href:'catalogo-compra-el-espacio.html' }
    ],
    pronto:[
      { label:'Iluminación', href:'proximamente-iluminacion.html' },
      { label:'Decoración',  href:'proximamente-decoracion.html' },
      { label:'Papel Mural', href:'proximamente-papel-mural.html' }
    ]
  }
};

var PAGINAS = [
  { key:'nosotros', label:'Quiénes somos', href:'quienes-somos.html' },
  { key:'contacto', label:'Contacto',      href:'contacto.html' }
];

var WA = 'https://wa.me/51920775559';
var WA_MSG = WA + '?text=' + encodeURIComponent('Hola Giandeco, quiero conversar sobre un proyecto.');

/* --------------------------------------------------------------------------
   2. CATÁLOGO DE PRODUCTOS  (fichas reales de 05_Mobiliario)
   Alimenta la mueblería y los puntos de compra sobre fotografía.
   -------------------------------------------------------------------------- */
var PRODUCTOS = {
  'centro-deluxe':   { nombre:'Centro Deluxe Nature',        cat:'Centro de TV', precio:'S/ 1,179.00', img:'images/mobiliario/centro-deluxe-1.webp',        nota:'Para TV de hasta 75". MDF 25 mm, 3 cajones con guías telescópicas, LED integrado.' },
  'centro-burnie':   { nombre:'Centro Burnie Cinamono',      cat:'Centro de TV', precio:'S/ 879.00',   img:'images/mobiliario/centro-burnie-1.webp',        nota:'Home suspendido para TV de hasta 70". Puertas basculantes con sistema push.' },
  'comoda-flow':     { nombre:'Cómoda Flow 1.37',            cat:'Dormitorio',   precio:'S/ 879.00',   img:'images/mobiliario/comoda-flow-1.webp',          nota:'4 cajones con correderas telescópicas de apertura por presión. Patas de madera maciza.' },
  'comedor-city12':  { nombre:'Comedor 1.2 City Bouclé',     cat:'Comedor',      precio:'S/ 2,949.00', img:'images/mobiliario/comedor-city12-1.jpg',        nota:'Ideal para 4 personas. Respaldo ergonómico curvo, tablero MDF 40 mm.' },
  'comedor-city180': { nombre:'Comedor 1.80 City Bouclé',    cat:'Comedor',      precio:'S/ 3,549.00', img:'images/mobiliario/comedor-city180-1.jpg?v=2',       nota:'Mesa ovalada de 1.80 para 6 personas. Bordes biselados, madera maciza.' },
  'comedor-living16':{ nombre:'Comedor 1.6 Living Vidrio',   cat:'Comedor',      precio:'S/ 3,549.00', img:'images/mobiliario/comedor-living16-1.jpg',      nota:'Para 6 personas. Tablero con vidrio en tono Off White y patas de madera maciza.' },
  'mesa-sara-canela':{ nombre:'Mesa Sara 1.2 Canela',        cat:'Comedor',      precio:'S/ 1,679.00', img:'images/mobiliario/mesa-sara-canela-1.jpg',      nota:'Para 4 personas. Tablero MDF 25 mm revestido en laminado de madera.' },
  'mesa-sara-vidrio':{ nombre:'Mesa Sara 1.2 Vidrio',        cat:'Comedor',      precio:'Consultar',   img:'images/mobiliario/mesa-sara-vidrio-1.jpg',      nota:'Variante con vidrio Off White y canela. Precio a confirmar con el estudio.' },
  'ropero-bilbao-crema':  { nombre:'Ropero Bilbao Crema',    cat:'Dormitorio',   precio:'S/ 499.00',   img:'images/mobiliario/ropero-bilbao-crema-1.webp',  nota:'4 puertas batientes, 3 repisas y 2 barras de colgar.' },
  'ropero-bilbao-rouble': { nombre:'Ropero Bilbao Rouble',   cat:'Dormitorio',   precio:'S/ 499.00',   img:'images/mobiliario/ropero-bilbao-rouble-1.webp', nota:'4 puertas batientes, 3 repisas y 2 barras de colgar.' },
  'ropero-porto-blanco':  { nombre:'Ropero Porto Blanco',    cat:'Dormitorio',   precio:'S/ 519.00',   img:'images/mobiliario/ropero-porto-blanco-1.webp',  nota:'2 puertas corredizas de deslizamiento suave, 3 repisas.' },
  'ropero-porto-rouble':  { nombre:'Ropero Porto Rouble',    cat:'Dormitorio',   precio:'S/ 519.00',   img:'images/mobiliario/ropero-porto-rouble-1.webp',  nota:'2 puertas corredizas de deslizamiento suave, 3 repisas.' }
};
window.GD_PRODUCTOS = PRODUCTOS;
window.GD_WA = WA_MSG;

/* --------------------------------------------------------------------------
   3. HEADER
   -------------------------------------------------------------------------- */
var body = document.body;
var mundoActual = body.getAttribute('data-mundo') || '';
var seccionActual = body.getAttribute('data-seccion') || '';
var paginaActual = body.getAttribute('data-pagina') || '';
var esHome = body.getAttribute('data-home') === 'true';

function iconoBuscar(){ return '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg>'; }

function headerHTML(){
  var mundos = Object.keys(SITIO).map(function(k){
    var m = SITIO[k];
    return '<a class="sh-mundo' + (k === mundoActual ? ' is-active' : '') + '" href="' + m.home + '">' + m.label + '</a>';
  }).join('');

  var paginas = PAGINAS.map(function(p){
    return '<a href="' + p.href + '"' + (p.key === paginaActual ? ' class="is-active"' : '') + '>' + p.label + '</a>';
  }).join('');

  // fila de secciones del mundo activo
  var secHTML = '', rightHTML = '';
  var m = SITIO[mundoActual];
  if(m){
    // se omite la sección "home" (Retail/Hogar/Catálogo) — ya está marcada
    // como activa arriba, en la fila de mundos; repetirla aquí es redundante.
    secHTML = m.secciones.filter(function(s){ return s.key !== 'home'; }).map(function(s){
      return '<a class="sh-cat-link' + (s.key === seccionActual ? ' is-active' : '') + '" href="' + s.href + '">' + s.label + '</a>';
    }).join('');
    if(m.pronto){
      rightHTML += m.pronto.map(function(p){
        return '<a class="sh-cat-link" data-pronto href="' + p.href + '" title="Disponible próximamente">' + p.label + '</a>';
      }).join('');
    }
  }
  rightHTML += '<button type="button" class="sh-buscar-inline" id="shBuscarInline">' + iconoBuscar() + 'Buscar</button>';

  // acordeones del menú móvil
  var acc = Object.keys(SITIO).map(function(k){
    var mm = SITIO[k];
    // aquí SÍ se conserva la sección "home": en el menú móvil el botón del
    // mundo solo abre/cierra el acordeón (no es un link), así que este es
    // el único lugar desde el que se puede navegar a la página principal
    // de ese mundo en pantallas chicas.
    var links = mm.secciones.map(function(s){ return '<a href="' + s.href + '">' + s.label + '</a>'; }).join('');
    if(mm.pronto) links += mm.pronto.map(function(p){ return '<a href="' + p.href + '" data-pronto title="Disponible próximamente">' + p.label + '</a>'; }).join('');
    return '<div class="sh-acc' + (k === mundoActual ? ' is-open' : '') + '">' +
      '<button type="button" class="sh-acc-btn">' + mm.label +
        '<svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 6l4 4 4-4"/></svg>' +
      '</button><div class="sh-acc-panel">' + links + '</div></div>';
  }).join('');

  return '' +
  '<header class="site-header" id="siteHeader">' +
    '<div class="sh-marca"><div class="sh-marca-in">' +
      '<div class="sh-left">' +
        '<button class="sh-burger" id="shBurger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="shMobile"><span></span><span></span><span></span></button>' +
        '<nav class="sh-mundos" aria-label="Mundos">' + mundos + '</nav>' +
      '</div>' +
      '<a class="sh-brand" href="index.html" aria-label="Inicio">' +
        '<img class="sh-brand-big" src="img/logo-negativo.svg" alt="Giandeco Studio Design">' +
        '<img class="sh-brand-mini" src="img/logo-positivo.svg" alt="Giandeco Studio Design">' +
      '</a>' +
      '<div class="sh-right">' +
        '<nav class="sh-paginas" aria-label="Páginas">' + paginas + '</nav>' +
        '<button class="sh-tema" id="shTema" type="button" aria-label="Cambiar a tema claro" title="Cambiar a tema claro">' +
          '<svg class="ico-sol" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.4"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>' +
          '<svg class="ico-luna" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.4"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>' +
        '</button>' +
        '<button class="sh-icon-btn sh-buscar-ico" id="shBuscarIco" type="button" aria-label="Buscar">' + iconoBuscar() + '</button>' +
        '<button class="sh-icon-btn" type="button" aria-label="Carrito">' +
          '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>' +
        '</button>' +
      '</div>' +
    '</div></div>' +
    '<div class="sh-categorias"><div class="sh-cat-in">' +
      '<nav class="sh-cat-nav" aria-label="Secciones">' + secHTML + '</nav>' +
      '<div class="sh-cat-right">' + rightHTML + '</div>' +
    '</div></div>' +
  '</header>' +
  '<div class="sh-scrim" id="shScrim"></div>' +
  '<nav class="sh-mobile" id="shMobile" aria-label="Menú móvil" aria-hidden="true">' +
    '<div class="sh-mobile-head"><span class="sh-mobile-logo">Giandeco</span>' +
      '<button class="sh-mobile-close" id="shMobileClose" type="button" aria-label="Cerrar menú">&times;</button></div>' +
    '<div class="sh-mobile-body">' + acc +
      '<div class="sh-mobile-paginas">' + PAGINAS.map(function(p){ return '<a href="' + p.href + '">' + p.label + '</a>'; }).join('') + '</div>' +
      '<div class="sh-mobile-cta">' +
        '<a class="gd-btn gd-btn-primary" href="' + WA_MSG + '" target="_blank" rel="noopener">Escribir por WhatsApp</a>' +
        '<a class="gd-btn gd-btn-ghost" href="contacto.html">Agendar visita técnica</a>' +
      '</div>' +
    '</div>' +
  '</nav>' +
  '<div class="sh-search-overlay" id="shSearchOverlay" aria-hidden="true">' +
    '<button class="sh-search-close" id="shSearchClose" type="button" aria-label="Cerrar búsqueda">&times;</button>' +
    '<div class="sh-search-in">' +
      '<input class="sh-search-input" id="shSearchInput" type="text" placeholder="Buscar…" autocomplete="off">' +
      '<div class="sh-search-chips" id="shSearchChips"></div>' +
      '<div class="sh-search-results" id="shSearchResults"></div>' +
    '</div>' +
  '</div>';
}

/* --------------------------------------------------------------------------
   4. FOOTER
   -------------------------------------------------------------------------- */
function footerHTML(){
  function col(titulo, items){
    return '<div class="gd-footer-col"><h4>' + titulo + '</h4><ul>' +
      items.map(function(i){ return '<li><a href="' + i.href + '">' + i.label + '</a></li>'; }).join('') +
    '</ul></div>';
  }
  return '' +
  '<footer class="gd-footer"><div class="gd-in">' +
    '<div class="gd-footer-grid">' +
      '<div class="gd-footer-brand">' +
        '<img src="img/logo-positivo.svg" alt="Giandeco Studio Design">' +
        '<p>Visual merchandising y diseño de espacios comerciales. Remodelamos su local, montamos la campaña y ejecutamos la obra bajo una sola dirección.</p>' +
      '</div>' +
      col('Retail', SITIO.retail.secciones.map(function(s){ return { label:s.key==='home'?'Retail':s.label, href:s.href }; })) +
      col('Catálogo', SITIO.catalogo.secciones.map(function(s){ return { label:s.key==='home'?'Ver catálogo':s.label, href:s.href }; })) +
      '<div class="gd-footer-col"><h4>Contacto</h4>' +
        '<ul class="gd-footer-contact">' +
          '<li><a href="' + WA_MSG + '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12C22 17.5228 17.5228 22 12 22C10.1786 22 8.47087 21.513 7 20.6622L2 21.5L2.83209 16C2.29689 14.7751 2 13.4222 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"/><path d="M12.9604 13.8683L15.0399 13.4624L17 14.2149V16.0385C17 16.6449 16.4783 17.1073 15.8901 16.9783C14.3671 16.6444 11.5997 15.8043 9.67826 13.8683C7.84859 12.0248 7.22267 9.45734 7.01039 8.04128C6.92535 7.47406 7.3737 7 7.94306 7H9.83707L10.572 8.96888L10.1832 11.0701"/></svg>+51 920 775 559</a></li>' +
          '<li><a href="mailto:contacto@giandeco.com">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>contacto@giandeco.com</a></li>' +
          '<li><a href="https://www.google.com/maps/search/?api=1&query=Ca.+Las+Bell%C3%ADsimas+170%2C+Urb.+Vipol%2C+Callao+07036" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.7 7-11.5A7 7 0 0 0 5 9.5C5 14.3 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/></svg>Ca. Las Bellísimas 170, Urb. Vipol — Callao 07036</a></li>' +
        '</ul>' +
        '<div class="gd-footer-social">' +
          '<a href="https://www.instagram.com/giandeco.studio/" target="_blank" rel="noopener" aria-label="Instagram">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>' +
          '<a href="https://www.facebook.com/profile.php?id=61593540694016" target="_blank" rel="noopener" aria-label="Facebook">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="gd-footer-bar">' +
      '<span>© 2026 Giandeco Studio Design. Todos los derechos reservados.</span>' +
      '<em>Espacios que saben vender</em>' +
    '</div>' +
  '</div></footer>';
}

/* --------------------------------------------------------------------------
   5. MONTAJE
   -------------------------------------------------------------------------- */
if(!esHome){
  var host = document.getElementById('gdHeader');
  if(host){ host.outerHTML = headerHTML(); }
  else { body.insertAdjacentHTML('afterbegin', headerHTML()); }

  var fhost = document.getElementById('gdFooter');
  if(fhost){ fhost.outerHTML = footerHTML(); }
  else { body.insertAdjacentHTML('beforeend', footerHTML()); }

  body.insertAdjacentHTML('afterbegin', '<div class="scroll-progress" id="scrollProgress"></div>');
}

/* --------------------------------------------------------------------------
   6. INTERACCIONES DEL HEADER
   -------------------------------------------------------------------------- */
var header = document.getElementById('siteHeader');
function setSolid(){ if(header) header.classList.toggle('is-solid', window.scrollY > 40); }
setSolid();
window.addEventListener('scroll', setSolid, { passive:true });

var burger = document.getElementById('shBurger');
var mobile = document.getElementById('shMobile');
var scrim  = document.getElementById('shScrim');
function abrirMovil(v){
  if(!mobile) return;
  mobile.classList.toggle('is-open', v);
  if(scrim) scrim.classList.toggle('is-open', v);
  if(burger){ burger.classList.toggle('is-open', v); burger.setAttribute('aria-expanded', v ? 'true' : 'false'); }
  mobile.setAttribute('aria-hidden', v ? 'false' : 'true');
  document.documentElement.style.overflow = v ? 'hidden' : '';
}
if(burger) burger.addEventListener('click', function(){ abrirMovil(!mobile.classList.contains('is-open')); });
var mClose = document.getElementById('shMobileClose');
if(mClose) mClose.addEventListener('click', function(){ abrirMovil(false); });
if(scrim) scrim.addEventListener('click', function(){ abrirMovil(false); });
document.querySelectorAll('.sh-acc-btn').forEach(function(btn){
  btn.addEventListener('click', function(){ btn.parentNode.classList.toggle('is-open'); });
});

/* búsqueda */
var INDICE = [];
Object.keys(SITIO).forEach(function(k){
  SITIO[k].secciones.forEach(function(s){ INDICE.push({ label: SITIO[k].label + ' · ' + s.label, href:s.href }); });
  (SITIO[k].pronto || []).forEach(function(p){ INDICE.push({ label: p.label + ' (próximamente)', href:p.href }); });
});
PAGINAS.forEach(function(p){ INDICE.push({ label:p.label, href:p.href }); });
Object.keys(PRODUCTOS).forEach(function(k){ INDICE.push({ label: PRODUCTOS[k].nombre + ' — ' + PRODUCTOS[k].precio, href:'catalogo-muebleria.html#' + k }); });

var overlay = document.getElementById('shSearchOverlay');
var input = document.getElementById('shSearchInput');
var chips = document.getElementById('shSearchChips');
var results = document.getElementById('shSearchResults');
function pintarResultados(q){
  if(!results) return;
  var t = (q || '').trim().toLowerCase();
  if(!t){ results.innerHTML = '<p class="sh-search-empty">Escriba para buscar entre servicios, proyectos y productos.</p>'; return; }
  var hits = INDICE.filter(function(i){ return i.label.toLowerCase().indexOf(t) !== -1; }).slice(0, 8);
  results.innerHTML = hits.length
    ? hits.map(function(h){ return '<a class="sh-search-result" href="' + h.href + '">' + h.label + '</a>'; }).join('')
    : '<p class="sh-search-empty">Sin resultados. Escríbanos por WhatsApp y le respondemos.</p>';
}
function abrirBuscar(){ if(!overlay) return; overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false'); if(input){ input.value=''; input.focus(); } pintarResultados(''); }
function cerrarBuscar(){ if(!overlay) return; overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true'); }
if(chips){
  chips.innerHTML = ['Visual merchandising','Escaparate','Navidad','Mueblería','Visita técnica']
    .map(function(f){ return '<button type="button" class="sh-search-chip">' + f + '</button>'; }).join('');
  chips.addEventListener('click', function(e){
    var b = e.target.closest('.sh-search-chip'); if(!b) return;
    if(input){ input.value = b.textContent; } pintarResultados(b.textContent);
  });
}
if(input) input.addEventListener('input', function(){ pintarResultados(input.value); });
['shBuscarIco','shBuscarInline'].forEach(function(id){
  var el = document.getElementById(id); if(el) el.addEventListener('click', abrirBuscar);
});
var sClose = document.getElementById('shSearchClose');
if(sClose) sClose.addEventListener('click', cerrarBuscar);
if(overlay) overlay.addEventListener('click', function(e){ if(e.target === overlay) cerrarBuscar(); });
document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ cerrarBuscar(); abrirMovil(false); } });

/* --------------------------------------------------------------------------
   7. REVELADO AL SCROLL + BARRA DE PROGRESO
   -------------------------------------------------------------------------- */
var revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .gd-curtain');
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold:.12, rootMargin:'0px 0px -6% 0px' });
  revealTargets.forEach(function(el){ io.observe(el); });
} else {
  revealTargets.forEach(function(el){ el.classList.add('is-visible'); });
}

var progressEl = document.getElementById('scrollProgress');
if(progressEl){
  var ticking = false;
  function actualizarProgreso(){
    var st = window.scrollY || 0;
    var max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var pct = Math.min(100, Math.max(0, (st / max) * 100));
    progressEl.style.transform = 'scaleX(' + (pct / 100) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(actualizarProgreso); }
  }, { passive:true });
  actualizarProgreso();
}

/* --------------------------------------------------------------------------
   8. PUNTOS DE COMPRA SOBRE FOTOGRAFÍA
   Markup esperado:
   <div class="gd-shop">
     <img class="gd-shop-img" src="…">
     <button class="gd-shop-dot" style="left:32%;top:58%" data-prod="comoda-flow"></button>
   </div>
   -------------------------------------------------------------------------- */
function montarPuntos(){
  document.querySelectorAll('.gd-shop').forEach(function(shop){
    var dots = shop.querySelectorAll('.gd-shop-dot');
    if(!dots.length) return;

    dots.forEach(function(dot){
      dot.innerHTML = '<b aria-hidden="true"></b><i aria-hidden="true"></i>';
      var key = dot.getAttribute('data-prod');
      var p = PRODUCTOS[key];
      var nombre = p ? p.nombre : (dot.getAttribute('data-nombre') || 'Pieza');
      dot.setAttribute('aria-label', 'Ver ' + nombre);
      dot.setAttribute('type', 'button');
    });

    var card = document.createElement('div');
    card.className = 'gd-shop-card';
    shop.appendChild(card);
    var abierto = null;

    function cerrar(){
      card.classList.remove('is-open');
      if(abierto){ abierto.classList.remove('is-open'); abierto = null; }
    }

    function abrir(dot){
      var key = dot.getAttribute('data-prod');
      var p = PRODUCTOS[key];
      var nombre = p ? p.nombre : (dot.getAttribute('data-nombre') || 'Pieza del espacio');
      var cat    = p ? p.cat    : (dot.getAttribute('data-cat') || 'Giandeco');
      var precio = p ? p.precio : (dot.getAttribute('data-precio') || 'Consultar');
      var img    = p ? p.img    : (dot.getAttribute('data-img') || '');
      var href   = dot.getAttribute('data-href') || (p ? 'catalogo-muebleria.html#' + key : WA_MSG);

      card.innerHTML =
        '<button class="gd-shop-card-close" type="button" aria-label="Cerrar">&times;</button>' +
        (img ? '<img decoding="async" class="gd-shop-card-img" src="' + img + '" alt="' + nombre + '">' : '') +
        '<div class="gd-shop-card-body">' +
          '<span class="gd-shop-card-cat">' + cat + '</span>' +
          '<span class="gd-shop-card-name">' + nombre + '</span>' +
          '<span class="gd-shop-card-price">' + precio + '</span>' +
          '<a class="gd-shop-card-cta" href="' + href + '">Ver la pieza' +
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a>' +
        '</div>';

      // colocación: al lado del punto, girando de lado si no hay aire
      var left = parseFloat(dot.style.left) || 50;
      var top  = parseFloat(dot.style.top) || 50;
      card.style.top = 'auto'; card.style.bottom = 'auto'; card.style.left = 'auto'; card.style.right = 'auto';
      if(left > 55){ card.style.right = (100 - left) + '%'; card.style.marginRight = '28px'; card.style.marginLeft = '0'; }
      else{ card.style.left = left + '%'; card.style.marginLeft = '28px'; card.style.marginRight = '0'; }
      if(top > 55){ card.style.bottom = (100 - top) + '%'; card.style.marginBottom = '-20px'; }
      else{ card.style.top = top + '%'; card.style.marginTop = '-20px'; }

      card.classList.add('is-open');
      if(abierto && abierto !== dot) abierto.classList.remove('is-open');
      dot.classList.add('is-open');
      abierto = dot;
    }

    shop.addEventListener('click', function(e){
      if(e.target.closest('.gd-shop-card-close')){ cerrar(); return; }
      if(e.target.closest('.gd-shop-card')) return;
      var dot = e.target.closest('.gd-shop-dot');
      if(dot){ e.preventDefault(); (dot === abierto) ? cerrar() : abrir(dot); return; }
      cerrar();
    });
    document.addEventListener('click', function(e){ if(!shop.contains(e.target)) cerrar(); });
  });
}
montarPuntos();

/* --------------------------------------------------------------------------
   8b. MARCAS — muro de logos reales, en dos filas con movimiento continuo.
   Todos se pintan en blanco sólido (filtro CSS) para que contrasten parejo
   sobre el fondo ébano, sin importar el color original de cada logo.
   Excepción: El Corte Inglés ya trae blanco reservado dentro de su banderín
   verde — forzarlo a blanco sólido fusiona el texto con el fondo y lo hace
   ilegible, así que ese conserva sus colores de marca (nativo:true).
   Falta el logo real de Baby Club — sigue en texto plano a propósito, no
   se inventa un archivo que no existe.
   Markup esperado — muro completo (home, y cualquier página que hable de
   todos los rubros): dos filas, sin "data-marcas" en el wall:
   <section class="gd-sec gd-marcas">
     <div class="gd-in"><p class="gd-eyebrow is-muted">...</p><h2 class="gd-h2">...</h2></div>
     <div class="gd-marcas-wall">
       <div class="gd-marcas-row" id="marcasRow1"><div class="gd-marcas-track" id="marcasTrack1"></div></div>
       <div class="gd-marcas-row gd-marcas-row--rev" id="marcasRow2"><div class="gd-marcas-track" id="marcasTrack2"></div></div>
     </div>
   </section>
   Markup para un mundo específico (ej. retail.html: solo marcas retail,
   una sola fila) — agregar data-marcas="retail" al wall y omitir la
   segunda fila:
   <div class="gd-marcas-wall" data-marcas="retail">
     <div class="gd-marcas-row" id="marcasRow1"><div class="gd-marcas-track" id="marcasTrack1"></div></div>
   </div>
   -------------------------------------------------------------------------- */
var MARCAS_TODAS_1 = [
  { nombre: 'El Corte Inglés', logo: 'images/marcas/el-corte-ingles.png', nativo: true },
  { nombre: 'Pycca', logo: 'images/marcas/pycca.png' },
  { nombre: 'Enchantée Paris', logo: 'images/marcas/enchantee-paris.png' },
  { nombre: 'Zara', logo: 'images/marcas/zara.png' },
  { nombre: 'Walon', logo: 'images/marcas/walon.png' },
  { nombre: 'Baby Club Chic', logo: 'images/marcas/baby-club-chic.png' }
];
var MARCAS_TODAS_2 = [
  { nombre: 'Hotel Unión Cusco', logo: 'images/marcas/hotel-union-cusco.png' },
  { nombre: 'Mássimo Café', logo: 'images/marcas/massimo-cafe.png' },
  { nombre: 'Casa Grande', logo: 'images/marcas/casa-grande.png' },
  { nombre: 'Casacor', logo: 'images/marcas/casacor.png' },
  { nombre: 'Expodeco', logo: 'images/marcas/expodeco.png' }
];
// Solo las marcas que son retail de verdad (tienda/boutique/campaña) —
// Hotel Unión Cusco (hotelería), Mássimo Café (gastronomía), Casa Grande
// (mobiliario), Casacor/Expodeco (ferias) no son retail y no van aquí.
var MARCAS_RETAIL = [
  { nombre: 'El Corte Inglés', logo: 'images/marcas/el-corte-ingles.png', nativo: true },
  { nombre: 'Pycca', logo: 'images/marcas/pycca.png' },
  { nombre: 'Zara', logo: 'images/marcas/zara.png' },
  { nombre: 'Walon', logo: 'images/marcas/walon.png' },
  { nombre: 'Enchantée Paris', logo: 'images/marcas/enchantee-paris.png' },
  { nombre: 'Baby Club Chic', logo: 'images/marcas/baby-club-chic.png' }
];
function pintarFilaMarcas(el, items){
  if(!el) return;
  // El loop infinito mueve la fila con translateX(-50%): para que nunca se
  // vea el final (hueco vacío en monitores anchos), una "mitad" de la pista
  // tiene que ser más ancha que cualquier pantalla razonable. Con solo 5
  // logos no alcanza en monitores grandes, así que se repite la lista antes
  // de duplicarla para el loop.
  var REPETICIONES = 6;
  var base = [];
  for (var r = 0; r < REPETICIONES; r++) base = base.concat(items);
  var doble = base.concat(base);
  el.innerHTML = doble.map(function(it){
    var contenido = it.logo
      ? '<span class="gd-marcas-logo"><img decoding="async" src="' + it.logo + '" alt="' + it.nombre + '" loading="lazy"' + (it.nativo ? ' class="is-nativo"' : '') + '></span>'
      : it.nombre;
    return '<span class="gd-marcas-item">' + contenido + '</span>';
  }).join('');
}
function montarMarcas(){
  var t1 = document.getElementById('marcasTrack1');
  var t2 = document.getElementById('marcasTrack2');
  if(!t1 && !t2) return;
  var wall = document.querySelector('.gd-marcas-wall');
  var set = wall ? wall.getAttribute('data-marcas') : null;
  if(set === 'retail'){
    pintarFilaMarcas(t1, MARCAS_RETAIL);
  } else {
    pintarFilaMarcas(t1, MARCAS_TODAS_1);
    pintarFilaMarcas(t2, MARCAS_TODAS_2);
  }
}
montarMarcas();

/* --------------------------------------------------------------------------
   9. BOTONES MAGNÉTICOS
   -------------------------------------------------------------------------- */
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(reduced || !fino) return;

  document.querySelectorAll('.gd-btn, .gd-link, .sh-icon-btn, .sh-tema').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width/2);
      var dy = e.clientY - (r.top + r.height/2);
      el.style.transform = 'translate(' + (dx*.24).toFixed(1) + 'px,' + (dy*.28).toFixed(1) + 'px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
  });
})();

})();
