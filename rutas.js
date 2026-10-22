/* ==========================================================================
   GIANDECO — ORDEN DE LAS URL
   Una sola fuente para las direcciones del sitio. La usan hacer-seo.js,
   hacer-proyectos.js y hacer-rutas.js (las páginas de redirección).
   Documentado en docs/URLS.md.

   Regla: cada dirección dice dónde está la página.
     /catalogo/compra-espacio/mesa-servida     (catálogo › compra el espacio › espacio)
     /catalogo/navidad/tren-de-jengibre        (catálogo › gama › pieza)
     /retail/servicios/escaparatismo           (línea › servicios › servicio)
     /proyectos/pycca-ecuador                  (proyecto)

   Una ruta que termina en «/» es una sección con páginas dentro: vive en
   carpeta/index.html y GitHub Pages la sirve con barra final. El resto son
   hojas: carpeta/nombre.html se sirve como /carpeta/nombre.
   Siguen en la raíz (no cambian por configuraciones externas): cuenta,
   checkout, pagar, seguimiento, admin, mantenimiento, producto, 404,
   contacto y quienes-somos.
   ========================================================================== */
'use strict';

/* dirección antigua (sin .html)  →  ruta nueva */
var MAPA = [
  ['retail',                          'retail/'],
  ['retail-diseno-tiendas',           'retail/servicios/'],
  ['retail-escaparatismo',            'retail/servicios/escaparatismo'],
  ['retail-remodelacion-de-locales',  'retail/servicios/remodelacion-de-locales'],
  ['retail-visual-merchandising',     'retail/servicios/visual-merchandising'],
  ['retail-grafica-y-viniles',        'retail/servicios/grafica-y-viniles'],
  ['retail-navidad',                  'retail/navidad'],
  ['retail-proyectos',                'retail/proyectos'],
  ['retail-blog',                     'retail/blog'],

  ['hogar',                           'hogar/'],
  ['hogar-diseno-interiores',         'hogar/interiorismo/'],
  ['hogar-decoracion-y-ambientacion', 'hogar/interiorismo/decoracion-y-ambientacion'],
  ['hogar-mobiliario-a-medida',       'hogar/interiorismo/mobiliario-a-medida'],
  ['hogar-ambientacion-de-temporada', 'hogar/interiorismo/ambientacion-de-temporada'],
  ['hogar-espacios',                  'hogar/espacios'],
  ['hogar-proyectos',                 'hogar/proyectos'],
  ['hogar-blog',                      'hogar/blog'],

  ['catalogo',                        'catalogo/'],
  ['catalogo-navidad',                'catalogo/navidad/'],
  ['catalogo-muebleria',              'catalogo/muebleria/'],
  ['catalogo-iluminacion',            'catalogo/iluminacion/'],
  ['catalogo-compra-el-espacio',      'catalogo/compra-espacio/'],
  ['espacio-mesa-navidena',           'catalogo/compra-espacio/mesa-servida'],
  ['espacio-sala-dorada',             'catalogo/compra-espacio/sala-estar'],
  ['espacio-comedor-exterior',        'catalogo/compra-espacio/comedor-exterior'],
  ['espacio-casacor',                 'catalogo/compra-espacio/sala-casacor'],
  ['espacio-ferrehome',               'catalogo/compra-espacio/bazar-ferrehome'],
  ['espacio-massimo',                 'catalogo/compra-espacio/lounge-massimo'],
  ['proximamente-decoracion',         'catalogo/decoracion'],
  ['proximamente-papel-mural',        'catalogo/papel-mural'],

  ['evento-walon35',                  'proyectos/walon-35-anos'],
  ['proceso-expodeco',                'proyectos/expodeco-2024'],

  ['compra-segura',                   'ayuda/compra-segura'],
  ['envios-y-entregas',               'ayuda/envios-y-entregas'],
  ['cambios-y-garantia',              'ayuda/cambios-y-garantia'],
  ['preguntas-frecuentes',            'ayuda/preguntas-frecuentes'],
  ['opiniones',                       'ayuda/opiniones'],
  ['terminos-y-condiciones',          'legal/terminos-y-condiciones'],
  ['politica-de-privacidad',          'legal/politica-de-privacidad'],
  ['libro-de-reclamaciones',          'legal/libro-de-reclamaciones']
];

/* páginas que solo redirigen (la antigua ya no tiene contenido propio) */
var SOLO_REDIRIGEN = [
  ['proximamente-iluminacion', 'catalogo/iluminacion/']
];

/* secciones que existen solo para que la URL recortada no dé 404 */
var CENTROS = [
  ['ayuda/',  'ayuda/preguntas-frecuentes'],
  ['legal/',  'legal/terminos-y-condiciones']
];

/* palabras que, solas, también son datos (data-mundo="retail", key:'hogar'…):
   solo se reescriben dentro de un href o una redirección */
var AMBIGUAS = ['retail', 'hogar', 'catalogo', 'opiniones'];

var GAMAS = ['muebleria', 'iluminacion', 'navidad'];
function archivoDe(ruta){ return ruta.charAt(ruta.length - 1) === '/' ? ruta + 'index.html' : ruta + '.html'; }
function rutaDe(archivo){ return archivo === 'index.html' ? '' : archivo.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, ''); }
function rutaProducto(gama, slug){ return 'catalogo/' + gama + '/' + slug; }
function rutaProyecto(slug){ return 'proyectos/' + slug; }
/* descripción para buscadores y redes: ≤ max caracteres, sin palabras a medias.
   Corta en el último punto si queda al menos el 90 % del límite (no se pierde una idea entera); si no, en la última palabra completa y añade «…» */
function recortar(txt, max){
  txt = String(txt).replace(/\s+/g, ' ').trim();
  if(txt.length <= max) return txt;
  var frase = txt.slice(0, max).replace(/[^.!?]*$/, '');
  if(frase.length >= max * 0.9) return frase.trim();
  var corte = txt.slice(0, max - 1);
  if(/\S/.test(txt.charAt(max - 1))) corte = corte.replace(/\s+\S*$/, '');
  corte = corte.replace(/[\s,;:–—-]+$/, '').replace(/\s+(y|e|o|u|de|del|la|el|los|las|en|con|para|por|que|un|una)$/i, '').replace(/[\s,;:–—-]+$/, '');
  return corte + '…';
}
/* <base> para que los enlaces relativos valgan a cualquier profundidad.
   En producción es «/»; en el sitio de prueba (github.io/<repo>/) lo corrige el script. */
var BASE_HTML = "<base href=\"/\"><script>if(/\\.github\\.io$/.test(location.hostname))document.querySelector(\"base\").href=\"/\"+location.pathname.split(\"/\")[1]+\"/\";window.addEventListener(\"click\",function(e){if(e.defaultPrevented)return;var a=e.target.closest&&e.target.closest(\"a[href^='#']\");if(a&&a.getAttribute(\"href\").length>1){e.preventDefault();location.hash=a.getAttribute(\"href\")}})</script>";

/* el catálogo (js/giandeco.js) leído desde Node: { muebleria:{clave:pieza}, iluminacion:…, navidad:… } */
function slug(nombre){ return nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function catalogo(){
  var fuente = require('fs').readFileSync(__dirname + '/js/giandeco.js', 'utf8');
  function objeto(n){ var m = fuente.match(new RegExp('var ' + n + ' = (\\{[\\s\\S]*?\\r?\\n\\});')); return (new Function('return ' + m[1]))(); }
  return { muebleria:objeto('PRODUCTOS'), iluminacion:objeto('ILUMINACION'), navidad:objeto('NAVIDAD') };
}

module.exports = { slug:slug, catalogo:catalogo, MAPA:MAPA, SOLO_REDIRIGEN:SOLO_REDIRIGEN, CENTROS:CENTROS, AMBIGUAS:AMBIGUAS, GAMAS:GAMAS,
  archivoDe:archivoDe, rutaDe:rutaDe, rutaProducto:rutaProducto, rutaProyecto:rutaProyecto, recortar:recortar, BASE_HTML:BASE_HTML };
