/* ==========================================================================
   GIANDECO — FICHAS DE PROYECTO Y PÁGINAS DE SERVICIO
   Escribe una página por proyecto (proyecto-<slug>.html, desde
   js/gd-proyectos.js) y una por servicio (<slug>.html, desde
   js/gd-servicios.js), con el contenido ya renderizado (buen SEO, sin
   depender de JavaScript). Los que tienen `href` propio no generan página.
   Lo ejecuta hacer-seo.js; también puede correrse solo: node hacer-proyectos.js
   ========================================================================== */
var fs = require('fs'), path = require('path');
var RUTAS = require('./rutas.js');
global.window = global.window || {};
eval(fs.readFileSync(__dirname + '/js/gd-proyectos.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/js/gd-servicios.js', 'utf8'));
var D = window.GD_PROYECTOS, SV = window.GD_SERVICIOS, UI = require('./js/gd-proyectos-ui.js');
var V = (fs.readFileSync(__dirname + '/index.html', 'utf8').match(/giandeco\.css\?v=([\w]+)/) || [])[1] || '1';
var INDEX = fs.readFileSync(__dirname + '/index.html', 'utf8');
/* cada recurso toma la versión que lleva en index.html (la que se sube al cambiarlo); si no está allí, la del CSS general */
function ver(archivo){ return (INDEX.match(new RegExp(archivo.replace('.', '\\.') + '\\?v=([\\w]+)')) || [])[1] || V; }
var VC = ver('gd-chat.js');
var DOMINIO = 'https://giandeco.com';

/* cabecera, estilos y scripts comunes a fichas y servicios */
function documento(o){
  var ld = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:o.migas.map(function(m, i){
    return { '@type':'ListItem', position:i + 1, name:m[0], item:DOMINIO + '/' + m[1] }; }) };
  return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n' + RUTAS.BASE_HTML + '\n' +
    '<script src="js/gd-acceso.js?v=' + V + '"></script>\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + UI.esc(o.titulo) + '</title>\n' +
    '<meta name="description" content="' + UI.esc(o.desc) + '">\n' +
    '<meta name="theme-color" content="#0A0A09">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700&family=Jost:wght@200;300;400;500&family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet">\n' +
    '<link rel="preload" as="image" href="' + o.img + '" fetchpriority="high">\n' +
    ['giandeco', 'gd-tienda', 'gd-movil', 'gd-tema'].map(function(c){ return '<link rel="stylesheet" href="css/' + c + '.css?v=' + ver(c + '.css') + '">'; }).join('\n') + '\n' +
    '<script src="js/gd-tema.js?v=' + V + '"></script>\n' +
    '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n' +
    '</head>\n<body data-mundo="' + o.mundo + '" data-seccion="' + o.seccion + '" data-og="' + o.img.replace(/\?.*$/, '') + '">\n\n' +
    '<!-- generado por hacer-proyectos.js: no editar a mano -->\n' +
    '<div id="gdHeader"></div>\n<main class="pj">\n' + o.cuerpo + '\n</main>\n<div id="gdFooter"></div>\n' +
    '<script src="js/giandeco.js?v=' + V + '"></script>\n' +
    '<script src="js/gd-proyectos-ui.js?v=' + V + '"></script>\n' +
    '<script src="js/gd-tienda.js?v=' + V + '" defer></script>\n<script src="js/gd-movil.js?v=' + V + '" defer></script>\n<script src="js/gd-chat.js?v=' + VC + '" defer></script>\n</body>\n</html>\n';
}
function titular(nombre, cat){
  var t = nombre + ' — ' + cat + ' · Giandeco Studio Design';
  // Google corta hacia los 60 caracteres: si no entra, se queda el nombre
  return t.length > 65 ? nombre + ' · Giandeco Studio Design' : t;
}
function pagina(p){
  var L = D.LINEAS[p.lineas[0]];
  return documento({ titulo:titular(p.nombre, p.cat), desc:(p.reto + ' ' + p.res).replace(/\s+/g, ' ').slice(0, 158),
    img:p.galeria[0].src, mundo:p.lineas[0], seccion:'proyectos', cuerpo:UI.ficha(D, p),
    migas:[['Inicio', ''], [L.label, L.href], ['Proyectos', L.proyectos], [p.nombre, RUTAS.rutaProyecto(p.slug)]] });
}
function paginaServicio(s){
  var L = D.LINEAS[s.linea];
  return documento({ titulo:titular(s.nombre, L.label), desc:(s.frase + ' ' + s.intro).replace(/\s+/g, ' ').slice(0, 158),
    img:s.portada.src, mundo:s.linea, seccion:'diseno', cuerpo:UI.servicio(D, SV, s),
    migas:[['Inicio', ''], [L.label, L.href], [s.nombre, s.slug]] });
}
/* «Todos los proyectos»: la sección /proyectos/ que contiene las fichas */
function paginaIndice(){
  var WA = 'https://wa.me/51920775559?text=' + encodeURIComponent('Hola Giandeco, vi sus proyectos y quiero conversar sobre el mío.');
  var cuerpo = '<section class="gd-sec gd-esp-pg"><div class="gd-in">' +
    '<p class="gd-eyebrow">Proyectos</p><h1 class="pj-h1">Todos los proyectos</h1>' +
    '<p class="pj-p" style="margin-bottom:var(--sp-40);">Tiendas, campañas, gastronomía, interiorismo, eventos y ferias, de Retail y de Hogar.</p>' +
    UI.rejilla(D, D.lista, { filtros:true }) + '</div></section>' +
    '<section class="gd-sec pj-cta"><div class="gd-in"><h2 class="pj-h2">¿Un proyecto así para su marca o su casa?</h2><div class="pj-cta-acc">' +
    '<a class="gd-btn gd-btn-primary" href="' + WA + '" target="_blank" rel="noopener">Hablemos de su proyecto' +
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a></div></div></section>';
  var d = D.lista.filter(function(p){ return p.destacado; })[0] || D.lista[0];
  return documento({ titulo:'Proyectos — Giandeco Studio Design', desc:'Tiendas, campañas, gastronomía, interiorismo, eventos y ferias de Giandeco, de Retail y de Hogar: fotos, proceso y resultado.',
    img:d.galeria[0].src, mundo:'retail', seccion:'proyectos', cuerpo:cuerpo,
    migas:[['Inicio', ''], ['Proyectos', 'proyectos/']] });
}

function escribir(archivo, contenido){
  fs.mkdirSync(path.dirname(__dirname + '/' + archivo), { recursive:true });
  fs.writeFileSync(__dirname + '/' + archivo, contenido);
}
var MARCA = /generado por hacer-proyectos\.js/;
var hechas = [], escritas = {};
D.lista.filter(function(p){ return !p.href; }).forEach(function(p){
  var archivo = RUTAS.archivoDe(RUTAS.rutaProyecto(p.slug)); escribir(archivo, pagina(p)); escritas[archivo] = 1; hechas.push(p.slug);
});
escribir('proyectos/index.html', paginaIndice()); escritas['proyectos/index.html'] = 1;
var servicios = SV.lista.filter(function(s){ return !s.href; });
servicios.forEach(function(s){
  var archivo = s.slug + '.html', f = __dirname + '/' + archivo;
  // nunca pisa una página hecha a mano con el mismo nombre
  if(fs.existsSync(f) && !MARCA.test(fs.readFileSync(f, 'utf8'))) throw new Error(archivo + ' ya existe y no es generada');
  escribir(archivo, paginaServicio(s)); escritas[archivo] = 1;
});
// borra lo generado antes que ya no corresponde (un proyecto que se quitó o que pasó a tener página propia)
['proyectos', 'retail/servicios', 'hogar/interiorismo'].forEach(function(dir){
  if(!fs.existsSync(__dirname + '/' + dir)) return;
  fs.readdirSync(__dirname + '/' + dir).forEach(function(n){
    var archivo = dir + '/' + n;
    if(/\.html$/.test(n) && !escritas[archivo] && MARCA.test(fs.readFileSync(__dirname + '/' + archivo, 'utf8'))) fs.unlinkSync(__dirname + '/' + archivo);
  });
});
console.log(hechas.length + ' fichas de proyecto · ' + servicios.length + ' páginas de servicio · índice de proyectos');
module.exports = hechas;
