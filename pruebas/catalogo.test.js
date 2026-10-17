/* ==========================================================================
   Pruebas del motor del catálogo global (js/gd-catalogo.js) con los datos
   reales del repositorio. Sin dependencias:  node pruebas/catalogo.test.js
   ========================================================================== */
'use strict';
var fs = require('fs'), path = require('path'), R = path.join(__dirname, '..') + '/';
var src = fs.readFileSync(R + 'js/giandeco.js', 'utf8');
function objeto(n){ var m = src.match(new RegExp('var ' + n + ' = (\\{[\\s\\S]*?\\r?\\n\\});')); return (new Function('return ' + m[1]))(); }
global.window = {};
eval(fs.readFileSync(R + 'js/gd-proyectos.js', 'utf8'));
eval(fs.readFileSync(R + 'js/gd-servicios.js', 'utf8'));
var tienda = fs.readFileSync(R + 'js/gd-tienda.js', 'utf8');
var ESPACIOS = (new Function(tienda.match(/(var ESPACIOS = \[[\s\S]*?\n\];)/)[1] + ' return ESPACIOS;'))();
var C = require(R + 'js/gd-catalogo.js');
var P = { muebleria:objeto('PRODUCTOS'), iluminacion:objeto('ILUMINACION'), navidad:objeto('NAVIDAD') };
var items = C.indexar({ productos:P, nuevos:[], url:function(k){ return k; }, servicios:window.GD_SERVICIOS, proyectos:window.GD_PROYECTOS, espacios:ESPACIOS });
var R_ = function(q){ return C.resultados(items, C.desdeURL(q)); };
var nNavidad = Object.keys(P.navidad).length, nProd = Object.keys(P.muebleria).length + Object.keys(P.iluminacion).length + nNavidad;
var fallos = 0, total = 0;
function prueba(nombre, cond){ total++; if(!cond){ fallos++; console.log('FALLA  ' + nombre); } else console.log('ok     ' + nombre); }

prueba('sin filtros muestra todo', R_('').length === items.length);
prueba('solo productos', R_('?tipo=producto').length === nProd && R_('?tipo=producto').every(function(i){ return i.tipo === 'producto'; }));
prueba('productos + Navidad = solo productos navideños', R_('?tipo=producto&cat=navidad').length === nNavidad && R_('?tipo=producto&cat=navidad').every(function(i){ return i.gamas[0] === 'navidad'; }));
prueba('Navidad + proyectos no trae productos', R_('?tipo=proyecto&cat=navidad').every(function(i){ return i.tipo === 'proyecto'; }));
prueba('varias categorías se suman (O)', R_('?tipo=producto&cat=navidad,iluminacion').length === nNavidad + Object.keys(P.iluminacion).length);
prueba('facetas distintas se combinan (Y)', R_('?tipo=producto&cat=navidad&precio=hasta-100').every(function(i){ return i.valor < 100 && i.gamas[0] === 'navidad'; }));
var e = C.desdeURL('?tipo=producto&cat=navidad&precio=hasta-100'); e.precio = [];
prueba('quitar un filtro conserva los demás', C.resultados(items, e).length === nNavidad);
prueba('cambiar de tipo descarta filtros que no aplican', C.aURL(C.limpiar(Object.assign(C.desdeURL('?tipo=producto&precio=hasta-100&cat=navidad'), { tipo:'proyecto' }))) === '?tipo=proyecto&cat=navidad');
prueba('búsqueda sin tildes ni mayúsculas', R_('?q=LAMPARA').length > 0);
prueba('búsqueda por referencia', R_('?q=comedor-city12').some(function(i){ return i.key === 'comedor-city12'; }));
var asc = R_('?tipo=producto&orden=precio-asc').filter(function(i){ return i.valor != null; }).map(function(i){ return i.valor; });
prueba('orden por precio ascendente', asc.every(function(v, i){ return !i || asc[i - 1] <= v; }));
prueba('sin coincidencias devuelve vacío', R_('?q=zzzz').length === 0);
prueba('la URL ida y vuelta es estable', C.aURL(C.desdeURL('?tipo=producto&cat=navidad,muebleria&q=reno&orden=az')) === '?tipo=producto&cat=navidad,muebleria&q=reno&orden=az');
prueba('valores inválidos en la URL se ignoran', C.aURL(C.desdeURL('?tipo=xx&orden=zz')) === '');
prueba('en «Todo» solo se ofrece la categoría', C.facetas(items, C.desdeURL('')).map(function(f){ return f.key; }).join() === 'cat');
prueba('las facetas de un tipo no aparecen en otro', C.facetas(items, C.desdeURL('?tipo=servicio')).every(function(f){ return f.key !== 'precio' && f.key !== 'sub'; }));
prueba('cada elemento tiene imagen y enlace', items.every(function(i){ return i.img && i.href && i.titulo; }));
prueba('identificadores únicos', new Set(items.map(function(i){ return i.id; })).size === items.length);

console.log('\n' + (total - fallos) + '/' + total + ' pruebas correctas');
process.exit(fallos ? 1 : 0);
