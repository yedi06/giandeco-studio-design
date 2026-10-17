/* ==========================================================================
   GIANDECO — REDIRECCIONES DE LAS URL ANTIGUAS
   GitHub Pages no hace redirecciones del servidor, así que cada dirección
   antigua conserva una página mínima que lleva a la nueva (con la consulta y
   el ancla). Llevan <link rel="canonical"> a la dirección nueva, para que los
   buscadores las consoliden, y data-redireccion para que las herramientas las
   reconozcan. Se rehacen en cada pasada; no editar a mano.

   Lo ejecuta hacer-seo.js; también solo:  node hacer-rutas.js
   ========================================================================== */
'use strict';
var fs = require('fs'), path = require('path');
var RUTAS = require('./rutas.js');
var DOMINIO = 'https://giandeco.com';

function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function pagina(nuevo, profundidad){
  var rel = new Array(profundidad + 1).join('../') + nuevo;
  return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n' + RUTAS.BASE_HTML + '\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Esta página cambió de dirección — Giandeco Studio Design</title>\n' +
    '<link rel="canonical" href="' + DOMINIO + '/' + esc(nuevo) + '">\n' +
    '<meta http-equiv="refresh" content="0; url=' + esc(rel) + '">\n' +
    '<script>location.replace(' + JSON.stringify(nuevo) + ' + location.search + location.hash)</script>\n' +
    '</head>\n<body data-redireccion style="font-family:sans-serif;background:#0A0A09;color:#DED8CB;padding:40px;">\n' +
    '<!-- generado por hacer-rutas.js: no editar a mano -->\n' +
    '<p>Esta página cambió de dirección: <a style="color:#C9A24A" href="' + esc(nuevo) + '">ir a la nueva</a>.</p>\n</body>\n</html>\n';
}

/* [archivo de la dirección antigua, ruta nueva] */
function pares(){
  var p = [];
  RUTAS.MAPA.concat(RUTAS.SOLO_REDIRIGEN).forEach(function(m){ p.push([m[0] + '.html', m[1]]); });
  RUTAS.CENTROS.forEach(function(m){ p.push([RUTAS.archivoDe(m[0]), m[1]]); });
  // fichas de proyecto: /proyecto-<slug>  ->  /proyectos/<slug>
  global.window = global.window || {};
  var D = (function(){ var w = {}; var f = new Function('window', fs.readFileSync(__dirname + '/js/gd-proyectos.js', 'utf8')); f(w); return w.GD_PROYECTOS; })();
  D.lista.filter(function(x){ return !x.href; }).forEach(function(x){ p.push(['proyecto-' + x.slug + '.html', RUTAS.rutaProyecto(x.slug)]); });
  // piezas: /<nombre>  ->  /catalogo/<gama>/<nombre>
  var cat = RUTAS.catalogo();
  RUTAS.GAMAS.forEach(function(g){ Object.keys(cat[g]).forEach(function(k){ var s = RUTAS.slug(cat[g][k].nombre); p.push([s + '.html', RUTAS.rutaProducto(g, s)]); }); });
  return p;
}

var lista = pares(), hechas = 0;
// borra redirecciones que ya no corresponden
(function limpiar(dir){
  fs.readdirSync(dir || '.', { withFileTypes:true }).forEach(function(e){
    var q = dir ? dir + '/' + e.name : e.name;
    if(e.isDirectory()){ if(!/^(node_modules|docs|backend|images|img|css|js|\.git|pruebas)$/.test(e.name)) limpiar(q); }
    else if(/\.html$/.test(e.name) && /data-redireccion/.test(fs.readFileSync(q, 'utf8')) && !lista.some(function(x){ return x[0] === q; })) fs.unlinkSync(q);
  });
})('');
lista.forEach(function(x){
  var archivo = x[0], dir = path.dirname(archivo), prof = dir === '.' ? 0 : dir.split('/').length;
  // nunca pisa una página con contenido
  if(fs.existsSync(archivo) && !/data-redireccion/.test(fs.readFileSync(archivo, 'utf8'))) throw new Error(archivo + ' ya existe con contenido: no se puede redirigir');
  fs.mkdirSync(dir, { recursive:true });
  fs.writeFileSync(archivo, pagina(x[1], prof)); hechas++;
});
console.log(hechas + ' redirecciones de URL antiguas');
module.exports = lista;
