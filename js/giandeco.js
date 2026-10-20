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
    label:'Retail', home:'retail/',
    secciones:[
      { key:'home',      label:'Navidad',             href:'retail/', enSub:true },   // la página principal de Retail es Navidad: sale primero en la fila y queda marcada
      { key:'diseno',    label:'Servicios',           href:'retail/servicios/' },
      { key:'proyectos', label:'Proyectos',           href:'retail/proyectos' }
    ]
  },
  hogar: {
    label:'Hogar', home:'hogar/',
    secciones:[
      { key:'home',      label:'Hogar',                 href:'hogar/' },
      { key:'diseno',    label:'Interiorismo',          href:'hogar/interiorismo/' },
      { key:'proyectos', label:'Proyectos',             href:'hogar/proyectos' },
      { key:'espacios',  label:'Espacios',              href:'hogar/espacios' }
    ]
  },
  catalogo: {
    label:'Catálogo', home:'catalogo/',
    secciones:[
      { key:'home',       label:'Catálogo',           href:'catalogo/' },
      { key:'navidad',    label:'Navidad',            href:'catalogo/navidad/' },
      { key:'muebleria',  label:'Mueblería',          href:'catalogo/muebleria/' },
      { key:'iluminacion',label:'Iluminación',        href:'catalogo/iluminacion/' },
      { key:'espacio',    label:'Compra el espacio',  href:'catalogo/compra-espacio/' }
    ],
    pronto:[
      { label:'Decoración',  href:'catalogo/decoracion' },
      { label:'Papel Mural', href:'catalogo/papel-mural' }
    ]
  }
};

var PAGINAS = [
  { key:'nosotros', label:'Quiénes somos', href:'quienes-somos' },
  { key:'contacto', label:'Contacto',      href:'contacto' }
];

/* Datos del estudio: UNA sola fuente. La leen el pie, la capa de tienda (CFG.EMPRESA),
   las páginas legales (data-emp) y los scripts hacer-*.js, que los escriben ya en el HTML. */
var EMPRESA = {
  razon:'Luis Giancarlo Jiménez Sánchez',
  ruc:'10452729691',
  dir:'Ca. Las Bellísimas 170, Urb. Vipol — Callao 07036',
  correo:'contacto@giandeco.com',
  tel:'+51 920 775 559',
  horario:'lunes a sábado, de 9:00 a. m. a 6:00 p. m.'   // POR CONFIRMAR por el estudio: se cambia solo aquí
};
window.GD_EMPRESA = EMPRESA;
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
   2b. ILUMINACIÓN  (fichas reales de 07_Luminarias)
   -------------------------------------------------------------------------- */
var ILUMINACION = {
  'amaris':     { nombre:'Lámpara LED Amaris',   cat:'Colgante lineal',    precio:'S/ 550.00',   img:'images/iluminacion/amaris-1.jpg',     nota:'Home suspendido de líneas onduladas, 105 cm. Estructura ABS y silicón, 60W 220V, altura regulable, luz LED cálida.' },
  'basilea':    { nombre:'Lámpara Basilea',      cat:'Colgante múltiple',  precio:'S/ 480.00',   img:'images/iluminacion/basilea-1.jpg',    nota:'Estructura metálica y vidrio nacarado, 6 luces con socket E27 estándar. Acabado negro mate y cobre antiguo.' },
  'bristol':    { nombre:'Lámpara Bristol',      cat:'Colgante múltiple',  precio:'S/ 380.00',   img:'images/iluminacion/bristol-1.jpg',    nota:'Estructura metálica con brazos movibles y socket E27 estándar. Acabado negro mate y oro viejo.' },
  'lara':       { nombre:'Lámpara Lara Black',   cat:'Colgante individual',precio:'S/ 480.00',   img:'images/iluminacion/lara-1.jpg',        nota:'Aro circular en estructura metálica y acrílico, 38W 165/265V. Altura regulable, luz cálida.' },
  'longer':     { nombre:'Lámpara Longer',       cat:'Colgante lineal',    precio:'S/ 1,300.00', img:'images/iluminacion/longer-1.jpg',      nota:'Paneles verticales en cascada, estructura de aluminio y silicón. Luz LED tricolor, altura regulable, acabado negro mate.' },
  'mady-white': { nombre:'Lámpara Mady White',   cat:'Colgante individual',precio:'S/ 180.00',   img:'images/iluminacion/mady-white-1.jpg', nota:'Domo en estructura metálica y capuchón de madera, socket E27 estándar. Altura regulable, color blanco bone.' },
  'stratto':    { nombre:'Lámpara Stratto',      cat:'Colgante múltiple',  precio:'S/ 480.00',   img:'images/iluminacion/stratto-1.jpg',     nota:'Estructura metálica, 6 luces con socket E27 estándar. Incluye focos LED.' },
  'villa':      { nombre:'Lámpara Villa',        cat:'Colgante individual',precio:'S/ 250.00',   img:'images/iluminacion/villa-1.jpg',       nota:'Farolillo en estructura metálica, incluye foco LED. Acabado negro y madera avejentada.' },
  'spazio':     { nombre:'Lámpara Spazio',       cat:'Colgante lineal',    precio:'S/ 120.00',   img:'images/iluminacion/spazio-1.jpg',      nota:'Batería de cilindros en aluminio, 8W/220V. Altura regulable, luz LED cálida y blanca.' }
};
window.GD_ILUMINACION = ILUMINACION;

/* --------------------------------------------------------------------------
   2c. NAVIDAD — colección 2026  (fichas reales de 08_Navidad)
   -------------------------------------------------------------------------- */
var NAVIDAD = {
  'tren-jengibre':          { nombre:'Tren de jengibre',                    cat:'Jengibre',    precio:'S/ 72.30',  img:'images/navidad/tren-jengibre-1.jpg',           nota:'Pieza decorativa de temporada, colección jengibre.' },
  'casa-jengibre':          { nombre:'Casa de jengibre',                    cat:'Jengibre',    precio:'S/ 146.90', img:'images/navidad/casa-jengibre-1.jpg',           nota:'Casa de jengibre iluminada, con figuras y detalles glaseados.' },
  'cascanueces-musicales':  { nombre:'Cascanueces musicales',               cat:'Cascanueces', precio:'S/ 76.00',  img:'images/navidad/cascanueces-musicales-1.jpg',   nota:'Se venden por unidad. Disponible en 3 modelos.' },
  'cascanueces-mecedores':  { nombre:'Cascanueces mecedores',               cat:'Cascanueces', precio:'S/ 58.70',  img:'images/navidad/cascanueces-mecedores-1.jpg',   nota:'Se venden por unidad. Disponible en 3 modelos.' },
  'perritos-cascanueces':   { nombre:'Muñecos perritos cascanueces',        cat:'Cascanueces', precio:'S/ 54.10',  img:'images/navidad/perritos-cascanueces-1.jpg',    nota:'Se venden por unidad. Disponible en 3 modelos.' },
  'reno-recostado':         { nombre:'Adorno reno navideño recostado',      cat:'Adornos',     precio:'S/ 60.20',  img:'images/navidad/reno-recostado-1.jpg',          nota:'Material de poliresina.' },
  'reno-de-pie':            { nombre:'Adorno reno navideño de pie',         cat:'Adornos',     precio:'S/ 75.80',  img:'images/navidad/reno-de-pie-1.jpg',             nota:'Material de poliresina.' },
  'reno-recostado-plato':   { nombre:'Adorno reno recostado con plato',     cat:'Adornos',     precio:'S/ 104.20', img:'images/navidad/reno-recostado-plato-1.jpg',    nota:'Material de poliresina.' },
  'reno-de-pie-plato':      { nombre:'Adorno reno de pie con plato',        cat:'Adornos',     precio:'S/ 116.30', img:'images/navidad/reno-de-pie-plato-1.jpg',       nota:'Material de poliresina.' },
  'papa-noel':              { nombre:'Papá Noel',                          cat:'Figuras',     precio:'S/ 74.00',  img:'images/navidad/papa-noel-1.jpg',               nota:'20 cm de alto.' },
  'bombonera-caja-regalo':  { nombre:'Bombonera navideña caja de regalo',   cat:'Bomboneras',  precio:'S/ 48.10',  img:'images/navidad/bombonera-caja-regalo-1.jpg',   nota:'22 cm. Se vende por unidad, disponible en 2 modelos.' },
  'bombonera-casita':       { nombre:'Bombonera navideña casita',           cat:'Bomboneras',  precio:'S/ 57.20',  img:'images/navidad/bombonera-casita-1.jpg',        nota:'28 cm. Se vende por unidad, disponible en 2 modelos.' },
  'portavela-dorado':       { nombre:'Portavela dorado',                    cat:'Portavelas',  precio:'S/ 54.00',  img:'images/navidad/portavela-dorado-1.jpg',        nota:'Set de 3 unidades.' },
  'portavela-negro':        { nombre:'Portavela negro',                    cat:'Portavelas',  precio:'S/ 54.00',  img:'images/navidad/portavela-negro-1.jpg',         nota:'Set de 3 unidades.' },
  'venado-mediano':         { nombre:'Venado transparente mediano',        cat:'Adornos',     precio:'S/ 16.00',  img:'images/navidad/venado-mediano-1.jpg',          nota:'Se vende por unidad. Material de acrílico.' },
  'venado-pequeno':         { nombre:'Venado transparente pequeño',        cat:'Adornos',     precio:'S/ 16.00',  img:'images/navidad/venado-pequeno-1.jpg',          nota:'Se vende por unidad. Material de acrílico.' },
  'casa-musical':           { nombre:'Adorno casa musical',                cat:'Figuras',     precio:'S/ 110.50', img:'images/navidad/casa-musical-1.jpg',            nota:'Pieza decorativa de temporada.' },
  'taza-cascanuez-roja':    { nombre:'Taza cascanuez roja',                cat:'Mesa',        precio:'S/ 67.90',  img:'images/navidad/taza-cascanuez-roja-1.jpg',     nota:'Set de tres tazas.' },
  'taza-cascanuez':         { nombre:'Taza cascanuez',                     cat:'Mesa',        precio:'S/ 67.90',  img:'images/navidad/taza-cascanuez-1.jpg',          nota:'Set de tres tazas.' },
  'arbol-iluminado':        { nombre:'Árbol navideño iluminado',           cat:'Iluminados',  precio:'S/ 62.30',  img:'images/navidad/arbol-iluminado-1.jpg',         nota:'Material de porcelana.' },
  'casa-iluminada-mediana': { nombre:'Casa navideña iluminada mediana',    cat:'Iluminados',  precio:'S/ 40.80',  img:'images/navidad/casa-iluminada-mediana-1.jpg',  nota:'Material de porcelana.' },
  'muneco-nieve':           { nombre:'Muñeco de nieve iluminado',          cat:'Iluminados',  precio:'S/ 30.00',  img:'images/navidad/muneco-nieve-1.jpg',            nota:'Material de porcelana.' },
  'casa-iluminada-pequena': { nombre:'Casa navideña iluminada pequeña',    cat:'Iluminados',  precio:'S/ 40.80',  img:'images/navidad/casa-iluminada-pequena-1.jpg',  nota:'Material de porcelana.' },
  'arreglo-pino-berries':   { nombre:'Arreglo pino y berries',             cat:'Decoración',  precio:'S/ 34.00',  img:'images/navidad/arreglo-pino-berries-1.jpg',    nota:'Arreglo decorativo de temporada.' },
  'farol-124':              { nombre:'Farol 1.24 m',                       cat:'Farol',       precio:'S/ 245.00', img:'images/navidad/farol-124-1.jpg',               nota:'1.24 m de alto.' },
  'farol-157':              { nombre:'Farol 1.57 m',                       cat:'Farol',       precio:'S/ 260.00', img:'images/navidad/farol-157-1.jpg',               nota:'1.57 m de alto.' }
};
window.GD_NAVIDAD = NAVIDAD;

/* --------------------------------------------------------------------------
   2d. AJUSTES DEL PANEL DE ADMINISTRACIÓN
   Precio, visibilidad y piezas nuevas definidas en admin. GD_BASE
   conserva el catálogo completo para que el panel pueda mostrar también lo
   que está oculto en la tienda.
   -------------------------------------------------------------------------- */
(function(){
  var aj = null;
  try{ aj = JSON.parse(localStorage.getItem('gd.prod') || 'null'); }catch(e){}
  var L = { muebleria:PRODUCTOS, iluminacion:ILUMINACION, navidad:NAVIDAD };
  window.GD_NUEVOS = [];
  if(aj && aj.nuevos) Object.keys(aj.nuevos).forEach(function(k){
    var n = aj.nuevos[k];
    if(L[n.linea] && !L[n.linea][k]){ L[n.linea][k] = { nombre:n.nombre, cat:n.cat, precio:n.precio, img:n.img, nota:n.nota }; window.GD_NUEVOS.push(k); }
  });
  window.GD_BASE = JSON.parse(JSON.stringify(L));
  if(aj && aj.over) Object.keys(aj.over).forEach(function(k){
    var o = aj.over[k];
    Object.keys(L).forEach(function(l){
      if(!L[l][k]) return;
      if(o.activo === false){ delete L[l][k]; return; }
      if(o.precio != null) L[l][k].precio = 'S/ ' + Number(o.precio).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
    });
  });
  // stock: el que fijó el panel o, si no hay dato, el inicial de la tienda
  var STOCK_INICIAL = 1;
  Object.keys(L).forEach(function(l){
    Object.keys(L[l]).forEach(function(k){
      var o = aj && aj.over && aj.over[k];
      L[l][k].stock = o && o.stock != null ? o.stock : STOCK_INICIAL;
    });
  });
})();

/* --------------------------------------------------------------------------
   2e. RUTAS DE PRODUCTO
   Cada pieza vive en una dirección con su gama y su nombre: /catalogo/iluminacion/lampara-led-amaris.
   hacer-seo.js genera esas páginas con la misma regla. Las piezas añadidas
   desde el panel, que aún no tienen página, usan la ficha genérica.
   -------------------------------------------------------------------------- */
var RUTAS = {};
[['muebleria', PRODUCTOS], ['iluminacion', ILUMINACION], ['navidad', NAVIDAD]].forEach(function(g){
  Object.keys(g[1]).forEach(function(k){
    RUTAS[k] = 'catalogo/' + g[0] + '/' + g[1][k].nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  });
});
window.GD_URL = function(k){
  return (!RUTAS[k] || window.GD_NUEVOS.indexOf(k) !== -1) ? 'producto?p=' + encodeURIComponent(k) : RUTAS[k];
};

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
    secHTML = m.secciones.filter(function(s){ return s.key !== 'home' || s.enSub; }).map(function(s){
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
    // la sección "home" repite el nombre del mundo (Retail, Hogar, Catálogo): en el acordeón se llama "Ver todo"
    var links = mm.secciones.map(function(s){ var todo = s.key === 'home' && !s.enSub; return '<a href="' + s.href + '"' + (todo ? ' class="sh-acc-todo"' : '') + '>' + (todo ? 'Ver todo' : s.label) + '</a>'; }).join('');
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
      '<a class="sh-brand" href="./" aria-label="Inicio">' +
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
    '<div class="sh-mobile-head"><a class="sh-mobile-logo" href="./" aria-label="Giandeco Studio Design — Inicio"><img src="img/logo-negativo.svg" alt="Giandeco Studio Design"></a>' +
      '<button class="sh-mobile-close" id="shMobileClose" type="button" aria-label="Cerrar menú">&times;</button></div>' +
    '<div class="sh-mobile-body">' + acc +
      '<div class="sh-mobile-paginas">' + PAGINAS.map(function(p){ return '<a href="' + p.href + '">' + p.label + '</a>'; }).join('') + '</div>' +
      '<div class="sh-mobile-cta">' +
        '<a class="gd-btn gd-btn-primary" href="' + WA_MSG + '" target="_blank" rel="noopener">Escribir por WhatsApp</a>' +
        '<a class="gd-btn gd-btn-ghost" href="contacto">Agendar visita técnica</a>' +
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
      // el blog sale del menú y queda aquí, junto al resto del estudio
      col('Estudio', [{ label:'Retail', href:'retail/' }, { label:'Navidad para retail', href:'retail/navidad' }, { label:'Hogar', href:'hogar/' },
        { label:'Proyectos', href:'retail/proyectos' }, { label:'Quiénes somos', href:'quienes-somos' }, { label:'Blog', href:'retail/blog' }]) +
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
          '<a href="https://www.tiktok.com/@giandeco_studio" target="_blank" rel="noopener" aria-label="TikTok">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 2.5v12.5a5 5 0 1 1-5-5"/><path d="M15 2.5c.4 3.2 2.6 5.4 6 5.7"/></svg></a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<nav class="gd-footer-ayuda" aria-label="Ayuda y condiciones">' +
      [['ayuda/compra-segura','Compra segura'], ['ayuda/envios-y-entregas','Envíos y entregas'], ['ayuda/cambios-y-garantia','Cambios y garantía'],
       ['ayuda/preguntas-frecuentes','Preguntas frecuentes'], ['ayuda/opiniones','Opiniones de clientes'], ['legal/terminos-y-condiciones','Términos y condiciones'],
       ['legal/politica-de-privacidad','Privacidad']].map(function(l){ return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('') +
      '<a href="legal/politica-de-privacidad#cookies" data-gd-cookies>Cookies</a>' +
      '<a class="gd-footer-libro" href="legal/libro-de-reclamaciones" aria-label="Libro de Reclamaciones">' +
        '<img src="images/legal/libro-reclamaciones.svg" alt="Libro de Reclamaciones" width="204" height="128" decoding="async"></a>' +
    '</nav>' +
    '<div class="gd-footer-pagos"><span>Medios de pago</span>' +
      [['visa','Visa'], ['mastercard','Mastercard'], ['amex','American Express'], ['diners','Diners Club'], ['yape','Yape'], ['bcp','BCP']].map(function(m){
        return '<img src="images/pago/' + m[0] + '.svg" alt="' + m[1] + '" width="39" height="25" loading="lazy" decoding="async">'; }).join('') +
    '</div>' +
    '<div class="gd-footer-bar">' +
      '<span>© 2026 Giandeco Studio Design · ' + EMPRESA.razon + ', RUC ' + EMPRESA.ruc + ' · Atención de ' + EMPRESA.horario + ' · Todos los derechos reservados.</span>' +
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
// el blog ya no está en el menú, pero se sigue encontrando en la búsqueda
INDICE.push({ label:'Retail · Blog', href:'retail/blog' }, { label:'Hogar · Blog', href:'hogar/blog' }, { label:'Retail · Navidad para tiendas (montaje de campaña)', href:'retail/navidad' });
[[PRODUCTOS,'Mueblería'],[ILUMINACION,'Iluminación'],[NAVIDAD,'Navidad']].forEach(function(L){
  Object.keys(L[0]).forEach(function(k){
    var p = L[0][k];
    // la categoría y la línea también se buscan: "comedor", "colgante", "navidad"
    INDICE.push({ label: p.nombre + ' — ' + p.precio, href:window.GD_URL(k), extra: p.cat + ' ' + L[1], pieza:true, nombre:p.nombre, precio:p.precio, meta:p.cat + ' · ' + L[1], img:p.img });
  });
});
/* sin tildes ni mayúsculas: "lampara" encuentra "Lámpara" */
function plano(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9.]+/g, ' ').trim(); }
INDICE.forEach(function(i){ i.texto = plano(i.label + ' ' + (i.extra || '')); });

var overlay = document.getElementById('shSearchOverlay');
var input = document.getElementById('shSearchInput');
var chips = document.getElementById('shSearchChips');
var results = document.getElementById('shSearchResults');
function pintarResultados(q){
  if(!results) return;
  var t = plano(q);
  if(!t){ results.innerHTML = '<p class="sh-search-empty">Escriba para buscar entre servicios, proyectos y productos.</p>'; return; }
  // cada palabra debe aparecer; el plural también vale ("lamparas", "comedores")
  var palabras = t.split(' ').filter(function(w){ return w.length > 1; })   // una letra suelta coincide con todo
      .map(function(w){ return w.length > 4 ? w.replace(/(es|s)$/, '') : w; });
  var hits = INDICE.filter(function(i){ return palabras.length && palabras.every(function(w){ return i.texto.indexOf(w) !== -1; }); })
    .map(function(i){
      // primero lo que coincide en el nombre visible, y antes si empieza por la búsqueda
      var l = plano(i.label), n = palabras.every(function(w){ return l.indexOf(w) !== -1; }) ? 2 : 0;
      return { i:i, n: n + (l.indexOf(palabras[0]) === 0 ? 1 : 0) };
    })
    .sort(function(a, b){ return b.n - a.n; })
    .map(function(x){ return x.i; })
    .slice(0, 8);
  results.innerHTML = hits.length
    ? hits.map(function(h){
        if(!h.pieza || !h.img) return '<a class="sh-search-result" href="' + h.href + '">' + h.label + '</a>';
        // pieza del catálogo: foto, nombre, categoría y precio
        return '<a class="sh-search-result is-pieza" href="' + h.href + '"><span class="sh-sr-foto"><img src="' + h.img + '" alt="" width="72" height="72" loading="lazy" decoding="async"></span>' +
          '<span class="sh-sr-txt"><b>' + h.nombre + '</b><small>' + h.meta + '</small></span><span class="sh-sr-precio">' + h.precio + '</span></a>';
      }).join('')
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
var revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .reveal-underline, .gd-curtain, hr.rule');
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
/* iconos de Heroicons 2.2.0 (outline) · MIT · Tailwind Labs */
var ICO_OJO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>';
var ICO_AMPLIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>';
var ICO_CERRAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6l12 12"/></svg>';

/* vista ampliada: la fotografía sola, a pantalla completa */
function ampliarFoto(img){
  var luz = document.getElementById('gdLuz');
  if(!luz){
    document.body.insertAdjacentHTML('beforeend',
      '<div class="gd-luz" id="gdLuz" role="dialog" aria-modal="true" aria-label="Fotografía ampliada" aria-hidden="true">' +
        '<button type="button" class="gd-luz-x" aria-label="Cerrar">' + ICO_CERRAR + '</button>' +
        '<img alt=""><p class="gd-luz-cap"></p></div>');
    luz = document.getElementById('gdLuz');
    luz.addEventListener('click', function(e){ if(e.target === luz || e.target.closest('.gd-luz-x')) cerrarFoto(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') cerrarFoto(); });
  }
  var grande = luz.querySelector('img');
  grande.src = img.currentSrc || img.src; grande.alt = img.alt;
  luz.querySelector('.gd-luz-cap').textContent = 'Producción Giandeco';
  luz._vuelve = document.activeElement;
  luz.classList.add('is-open'); luz.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
  luz.querySelector('.gd-luz-x').focus();
}
window.GD_AMPLIAR = ampliarFoto;   // galerías de proyecto

/* fotos de producto enteras: si la foto no tiene la forma del marco (una
   lámpara cuadrada en una tarjeta 4:5), se muestra completa sobre fondo liso
   en vez de recortarla */
var MARCOS = '.gd-prod-thumb img, .pdp-plate img';
/* el fondo liso toma el color del borde de la foto, para que continúe sin corte.
   Se calcula una vez por foto: al volver a pintar una rejilla se reutiliza */
var COLOR_BORDE = {};
function colorDeBorde(img){
  var k = img.currentSrc || img.src;
  if(k in COLOR_BORDE) return COLOR_BORDE[k];
  return (COLOR_BORDE[k] = medirBorde(img));
}
function medirBorde(img){
  try{
    var c = document.createElement('canvas'), n = 12; c.width = c.height = n;
    var x = c.getContext('2d'); x.drawImage(img, 0, 0, n, n);
    var d = x.getImageData(0, 0, n, n).data, r = 0, g = 0, b = 0, k = 0;
    for(var i = 0; i < n; i++) for(var j = 0; j < n; j++){
      if(i && j && i < n - 1 && j < n - 1) continue;   // solo el contorno
      var p = (j * n + i) * 4; r += d[p]; g += d[p + 1]; b += d[p + 2]; k++;
    }
    return 'rgb(' + Math.round(r / k) + ',' + Math.round(g / k) + ',' + Math.round(b / k) + ')';
  }catch(e){ return ''; }
}
function encajarFoto(img){
  var caja = img.parentElement;
  if(!caja || !img.naturalWidth || !caja.clientWidth || !caja.clientHeight) return;
  var r = img.naturalWidth / img.naturalHeight, rc = caja.clientWidth / caja.clientHeight;
  var entera = Math.abs(r - rc) / rc > 0.04;
  caja.classList.toggle('es-entera', entera);
  if(entera) caja.style.backgroundColor = colorDeBorde(img);
}
document.addEventListener('load', function(e){ if(e.target.matches && e.target.matches(MARCOS)) encajarFoto(e.target); }, true);
document.querySelectorAll(MARCOS).forEach(function(img){ if(img.complete) encajarFoto(img); });
window.GD_ENCAJAR = encajarFoto;
/* foto de puntos muy ancha: se marca para dar puntos más pequeños en móvil */
function marcarAncha(img){ var s = img.closest && img.closest('.gd-shop'); if(s && img.naturalWidth) s.classList.toggle('is-ancha', img.naturalWidth / img.naturalHeight >= 1.6); }
document.addEventListener('load', function(e){ if(e.target.matches && e.target.matches('.gd-shop-img')) marcarAncha(e.target); }, true);
document.querySelectorAll('.gd-shop-img').forEach(function(img){ if(img.complete) marcarAncha(img); });
function cerrarFoto(){
  var luz = document.getElementById('gdLuz');
  if(!luz || !luz.classList.contains('is-open')) return;
  luz.classList.remove('is-open'); luz.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  if(luz._vuelve && luz._vuelve.focus) luz._vuelve.focus();
}

function montarPuntos(){
  document.querySelectorAll('.gd-shop').forEach(function(shop){
    var dots = shop.querySelectorAll('.gd-shop-dot');
    if(!dots.length) return;

    dots.forEach(function(dot){
      dot.innerHTML = '<b aria-hidden="true"></b><i aria-hidden="true"></i>';
      var key = dot.getAttribute('data-prod');
      var p = PRODUCTOS[key] || NAVIDAD[key] || ILUMINACION[key];
      var nombre = p ? p.nombre : (dot.getAttribute('data-nombre') || 'Pieza');
      dot.setAttribute('aria-label', 'Ver ' + nombre);
      dot.setAttribute('type', 'button');
    });

    // controles sobre la foto: ver solo el ambiente y ampliar
    var bar = document.createElement('div');
    bar.className = 'gd-shop-bar';
    bar.innerHTML = '<button type="button" class="gd-shop-ver" aria-pressed="false">' + ICO_OJO + '<span>Ver solo el ambiente</span></button>' +
      '<button type="button" class="gd-shop-amp" aria-label="Ampliar la fotografía" title="Ampliar">' + ICO_AMPLIAR + '</button>';
    shop.appendChild(bar);

    var card = document.createElement('div');
    card.className = 'gd-shop-card';
    shop.appendChild(card);
    var abierto = null;

    function cerrar(){
      card.classList.remove('is-open');
      if(abierto){ abierto.classList.remove('is-open'); abierto = null; }
    }

    // zona realmente visible de la fotografía: la foto puede estar recortada por un contenedor (portada de catálogo)
    // o quedar bajo el menú fijo; la ficha se acomoda dentro de eso, no del alto completo de la imagen
    function limites(){
      var r = shop.getBoundingClientRect(), L = r.left, T = r.top, R = r.right, B = r.bottom, el = shop.parentElement;
      while(el && el !== document.body){
        var cs = getComputedStyle(el);
        if(cs.overflowX !== 'visible' || cs.overflowY !== 'visible'){ var c = el.getBoundingClientRect(); L = Math.max(L, c.left); T = Math.max(T, c.top); R = Math.min(R, c.right); B = Math.min(B, c.bottom); }
        el = el.parentElement;
      }
      var h = document.querySelector('.site-header');
      if(h && getComputedStyle(h).position === 'fixed'){ var hb = h.querySelector('.sh-marca') ? h.querySelector('.sh-marca').getBoundingClientRect().bottom : h.getBoundingClientRect().bottom; if(hb > T && hb < B) T = hb; }
      return { left:L, top:T, right:R, bottom:B };
    }

    function abrir(dot){
      var key = dot.getAttribute('data-prod');
      var p = PRODUCTOS[key] || NAVIDAD[key] || ILUMINACION[key];
      var nombre = p ? p.nombre : (dot.getAttribute('data-nombre') || 'Pieza del espacio');
      var cat    = p ? p.cat    : (dot.getAttribute('data-cat') || 'Giandeco');
      var precio = p ? p.precio : (dot.getAttribute('data-precio') || 'Consultar');
      var img    = p ? p.img    : (dot.getAttribute('data-img') || '');
      var href   = p ? window.GD_URL(key) : (dot.getAttribute('data-href') || WA_MSG);
      // con la capa de tienda cargada, el punto también suma la pieza a la selección
      var sumar  = !window.GD_TIENDA ? '' : (p
        ? '<button class="gd-shop-card-add" type="button" data-gdt-add="' + key + '">Añadir a la bolsa</button>'
        : '<button class="gd-shop-card-add" type="button" data-gdt-add-esp="' + nombre + '" data-cat="' + cat + '">Añadir para cotizar</button>');

      card.innerHTML =
        '<button class="gd-shop-card-close" type="button" aria-label="Cerrar">&times;</button>' +
        (img ? '<img decoding="async" class="gd-shop-card-img" src="' + img + '" alt="' + nombre + '">' : '') +
        '<div class="gd-shop-card-body">' +
          '<span class="gd-shop-card-cat">' + cat + '</span>' +
          '<span class="gd-shop-card-name">' + nombre + '</span>' +
          '<span class="gd-shop-card-price">' + precio + '</span>' +
          sumar +
          '<a class="gd-shop-card-cta" href="' + href + '"' + (p ? '' : ' target="_blank" rel="noopener"') + '>' + (p ? 'Ver la pieza' : 'Consultar esta pieza') +
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

      // la ficha nunca se sale de la fotografía: si no cabe, se corre lo justo
      card.style.translate = '';
      var sr = limites(), cr = card.getBoundingClientRect(), aire = 10, dx = 0, dy = 0;
      if(cr.right > sr.right - aire) dx = sr.right - aire - cr.right;
      if(cr.left + dx < sr.left + aire) dx = sr.left + aire - cr.left;
      if(cr.bottom > sr.bottom - aire) dy = sr.bottom - aire - cr.bottom;
      if(cr.top + dy < sr.top + aire) dy = sr.top + aire - cr.top;
      card.style.translate = Math.round(dx) + 'px ' + Math.round(dy) + 'px';

      card.classList.add('is-open');
      if(abierto && abierto !== dot) abierto.classList.remove('is-open');
      dot.classList.add('is-open');
      abierto = dot;
    }

    shop.addEventListener('click', function(e){
      var ver = e.target.closest('.gd-shop-ver');
      if(ver){
        var oculto = shop.classList.toggle('sin-puntos');
        cerrar();
        ver.setAttribute('aria-pressed', oculto ? 'true' : 'false');
        ver.querySelector('span').textContent = oculto ? 'Mostrar las piezas' : 'Ver solo el ambiente';
        return;
      }
      if(e.target.closest('.gd-shop-amp')){ cerrar(); ampliarFoto(shop.querySelector('.gd-shop-img')); return; }
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
   Markup para un mundo específico (ej. retail: solo marcas retail,
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
   8c. DETALLE DEL MONTAJE — piezas sin foto de producto
   En "Las piezas de este espacio", una pieza que aún no tiene foto propia
   muestra un recorte ampliado de la fotografía del espacio, centrado en su
   punto de compra: se ve la pieza real, montada por el estudio, en vez de
   un recuadro vacío. Cuando la pieza tenga foto de producto, la tarjeta deja
   de ser .is-slot y esto no la toca.
   -------------------------------------------------------------------------- */
function detallesDeMontaje(){
  var foto = document.querySelector('.gd-shop .gd-shop-img');
  var slots = document.querySelectorAll('.gd-pieza-thumb.is-slot');
  if(!foto || !slots.length) return;
  function pintar(){
    var r = foto.naturalHeight / foto.naturalWidth;            // alto/ancho de la foto
    if(!r) return;
    var z = Math.max(3.2, 1.25 / r * 1.4);                      // ampliación: la miniatura es 4:5
    var src = foto.currentSrc || foto.src;
    slots.forEach(function(slot){
      var card = slot.parentElement, b = card && card.querySelector('[data-gdt-add-esp]');
      if(!b) return;
      var nombre = b.getAttribute('data-gdt-add-esp'), punto = null;
      document.querySelectorAll('.gd-shop-dot[data-nombre]').forEach(function(d){ if(d.getAttribute('data-nombre') === nombre) punto = d; });
      if(!punto) return;
      var px = parseFloat(punto.style.left) / 100, py = parseFloat(punto.style.top) / 100;
      if(isNaN(px) || isNaN(py)) return;
      // posición de fondo que deja el punto en el centro del recorte
      var bx = Math.min(1, Math.max(0, (px * z - .5) / (z - 1)));
      var by = Math.min(1, Math.max(0, (py * z * r - .625) / (z * r - 1.25)));
      slot.classList.remove('is-slot'); slot.classList.add('is-detalle');
      slot.style.backgroundImage = "url('" + src + "')";
      slot.style.backgroundSize = (z * 100).toFixed(1) + '% auto';
      slot.style.backgroundPosition = (bx * 100).toFixed(1) + '% ' + (by * 100).toFixed(1) + '%';
      slot.setAttribute('role', 'img');
      slot.setAttribute('aria-label', nombre + ', detalle de la fotografía del espacio');
      slot.innerHTML = '<span class="gd-detalle-tag">Detalle del montaje</span>';
    });
  }
  if(foto.complete && foto.naturalWidth) pintar(); else foto.addEventListener('load', pintar, { once:true });
}
// la grilla de piezas la arma el script de cada espacio, después de este archivo
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', detallesDeMontaje); else detallesDeMontaje();

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
