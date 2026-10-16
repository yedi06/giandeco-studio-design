/* ==========================================================================
   GIANDECO — FICHAS DE PROYECTO Y PÁGINAS DE SERVICIO
   Escribe una página por proyecto (proyecto-<slug>.html, desde
   js/gd-proyectos.js) y una por servicio (<slug>.html, desde
   js/gd-servicios.js), con el contenido ya renderizado (buen SEO, sin
   depender de JavaScript). Los que tienen `href` propio no generan página.
   Lo ejecuta hacer-seo.js; también puede correrse solo: node hacer-proyectos.js
   ========================================================================== */
var fs = require('fs');
global.window = global.window || {};
eval(fs.readFileSync(__dirname + '/js/gd-proyectos.js', 'utf8'));
eval(fs.readFileSync(__dirname + '/js/gd-servicios.js', 'utf8'));
var D = window.GD_PROYECTOS, SV = window.GD_SERVICIOS, UI = require('./js/gd-proyectos-ui.js');
var V = (fs.readFileSync(__dirname + '/index.html', 'utf8').match(/giandeco\.css\?v=([\w]+)/) || [])[1] || '1';
var DOMINIO = 'https://giandeco.com';

/* cabecera, estilos y scripts comunes a fichas y servicios */
function documento(o){
  var ld = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:o.migas.map(function(m, i){
    return { '@type':'ListItem', position:i + 1, name:m[0], item:DOMINIO + '/' + m[1] }; }) };
  return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n' +
    '<script src="js/gd-acceso.js?v=' + V + '"></script>\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + UI.esc(o.titulo) + '</title>\n' +
    '<meta name="description" content="' + UI.esc(o.desc) + '">\n' +
    '<meta name="theme-color" content="#0A0A09">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700&family=Jost:wght@200;300;400;500&family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet">\n' +
    '<link rel="preload" as="image" href="' + o.img + '" fetchpriority="high">\n' +
    ['giandeco', 'gd-tienda', 'gd-movil', 'gd-tema'].map(function(c){ return '<link rel="stylesheet" href="css/' + c + '.css?v=' + V + '">'; }).join('\n') + '\n' +
    '<script src="js/gd-tema.js?v=' + V + '"></script>\n' +
    '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>\n' +
    '</head>\n<body data-mundo="' + o.mundo + '" data-seccion="' + o.seccion + '" data-og="' + o.img.replace(/\?.*$/, '') + '">\n\n' +
    '<!-- generado por hacer-proyectos.js: no editar a mano -->\n' +
    '<div id="gdHeader"></div>\n<main class="pj">\n' + o.cuerpo + '\n</main>\n<div id="gdFooter"></div>\n' +
    '<script src="js/giandeco.js?v=' + V + '"></script>\n' +
    '<script src="js/gd-proyectos-ui.js?v=' + V + '"></script>\n' +
    '<script src="js/gd-tienda.js?v=' + V + '" defer></script>\n<script src="js/gd-movil.js?v=' + V + '" defer></script>\n<script src="js/gd-chat.js?v=' + V + '" defer></script>\n</body>\n</html>\n';
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
    migas:[['Inicio', ''], [L.label, L.href], ['Proyectos', L.proyectos], [p.nombre, 'proyecto-' + p.slug]] });
}
function paginaServicio(s){
  var L = D.LINEAS[s.linea];
  return documento({ titulo:titular(s.nombre, L.label), desc:(s.frase + ' ' + s.intro).replace(/\s+/g, ' ').slice(0, 158),
    img:s.portada.src, mundo:s.linea, seccion:'diseno', cuerpo:UI.servicio(D, SV, s),
    migas:[['Inicio', ''], [L.label, L.href], [s.nombre, s.slug]] });
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
var servicios = SV.lista.filter(function(s){ return !s.href; });
servicios.forEach(function(s){
  var f = __dirname + '/' + s.slug + '.html';
  // nunca pisa una página hecha a mano con el mismo nombre
  if(fs.existsSync(f) && !/generado por hacer-proyectos\.js/.test(fs.readFileSync(f, 'utf8'))) throw new Error(s.slug + '.html ya existe y no es generada');
  fs.writeFileSync(f, paginaServicio(s));
});
console.log(hechas.length + ' fichas de proyecto · ' + servicios.length + ' páginas de servicio');
module.exports = hechas;
