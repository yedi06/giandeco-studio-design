/* ==========================================================================
   GIANDECO — FICHAS DE PROYECTO
   Escribe una página por proyecto (proyecto-<slug>.html) a partir de
   js/gd-proyectos.js, con el contenido ya renderizado (buen SEO, sin depender
   de JavaScript). Los proyectos con `href` propio no generan ficha.
   Lo ejecuta hacer-seo.js; también puede correrse solo: node hacer-proyectos.js
   ========================================================================== */
var fs = require('fs');
global.window = global.window || {};
eval(fs.readFileSync(__dirname + '/js/gd-proyectos.js', 'utf8'));
var D = window.GD_PROYECTOS, UI = require('./js/gd-proyectos-ui.js');
var V = (fs.readFileSync(__dirname + '/index.html', 'utf8').match(/giandeco\.css\?v=([\w]+)/) || [])[1] || '1';
var DOMINIO = 'https://giandeco.com';

function pagina(p){
  var L = D.LINEAS[p.lineas[0]];
  var titulo = p.nombre + ' — ' + p.cat + ' · Giandeco Studio Design';
  // Google corta hacia los 60 caracteres: si no entra, se queda el nombre
  if(titulo.length > 65) titulo = p.nombre + ' · Giandeco Studio Design';
  var desc = (p.reto + ' ' + p.res).replace(/\s+/g, ' ').slice(0, 158);
  var migas = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
    { '@type':'ListItem', position:1, name:'Inicio', item:DOMINIO + '/' },
    { '@type':'ListItem', position:2, name:L.label, item:DOMINIO + '/' + L.href },
    { '@type':'ListItem', position:3, name:'Proyectos', item:DOMINIO + '/' + L.proyectos },
    { '@type':'ListItem', position:4, name:p.nombre, item:DOMINIO + '/proyecto-' + p.slug }] };
  return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n' +
    '<script src="js/gd-acceso.js?v=' + V + '"></script>\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + UI.esc(titulo) + '</title>\n' +
    '<meta name="description" content="' + UI.esc(desc) + '">\n' +
    '<meta name="theme-color" content="#0A0A09">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700&family=Jost:wght@200;300;400;500&family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet">\n' +
    '<link rel="preload" as="image" href="' + p.galeria[0].src + '" fetchpriority="high">\n' +
    ['giandeco', 'gd-tienda', 'gd-movil', 'gd-tema'].map(function(c){ return '<link rel="stylesheet" href="css/' + c + '.css?v=' + V + '">'; }).join('\n') + '\n' +
    '<script src="js/gd-tema.js?v=' + V + '"></script>\n' +
    '<script type="application/ld+json">' + JSON.stringify(migas) + '</script>\n' +
    '</head>\n<body data-mundo="' + p.lineas[0] + '" data-seccion="proyectos" data-og="' + p.galeria[0].src.replace(/\?.*$/, '') + '">\n\n' +
    '<!-- generado por hacer-proyectos.js desde js/gd-proyectos.js: no editar a mano -->\n' +
    '<div id="gdHeader"></div>\n<main class="pj" data-slug="' + p.slug + '">\n' + UI.ficha(D, p) + '\n</main>\n<div id="gdFooter"></div>\n' +
    '<script src="js/giandeco.js?v=' + V + '"></script>\n' +
    '<script src="js/gd-proyectos-ui.js?v=' + V + '"></script>\n' +
    '<script src="js/gd-tienda.js?v=' + V + '" defer></script>\n<script src="js/gd-movil.js?v=' + V + '" defer></script>\n<script src="js/gd-chat.js?v=' + V + '" defer></script>\n</body>\n</html>\n';
}
var hechas = [];
// borra fichas de proyectos que ya no existen o pasaron a tener página propia
fs.readdirSync(__dirname).filter(function(f){ return /^proyecto-.+\.html$/.test(f); }).forEach(function(f){
  var s = f.slice(9, -5), p = D.get(s);
  if(!p || p.href) fs.unlinkSync(__dirname + '/' + f);
});
D.lista.filter(function(p){ return !p.href; }).forEach(function(p){
  fs.writeFileSync(__dirname + '/proyecto-' + p.slug + '.html', pagina(p)); hechas.push(p.slug);
});
console.log(hechas.length + ' fichas de proyecto');
module.exports = hechas;
