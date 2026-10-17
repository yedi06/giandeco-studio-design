/* ==========================================================================
   GIANDECO — CATÁLOGO GLOBAL: índice y filtros
   Solo datos y lógica (sin HTML): reúne productos, servicios, proyectos y
   espacios en un índice común, calcula las facetas con sus conteos, filtra,
   busca y ordena. La interfaz está en js/gd-catalogo-ui.js.
   Sirve en el navegador (window.GD_CATALOGO) y en Node (pruebas).

   Categoría y tipo de contenido son cosas distintas:
     tipo       qué es: producto, servicio, proyecto o espacio
     categoría  la gama comercial: Navidad, Mueblería, Iluminación…
   Un proyecto navideño es tipo «proyecto» con categoría «navidad».

   Para una gama o temporada nueva basta con añadirla a GAMAS (y a los datos
   de origen); para un atributo nuevo, una entrada en FACETAS.
   ========================================================================== */
(function(raiz){
'use strict';

var TIPOS = [
  { key:'producto', label:'Productos', uno:'Producto' },
  { key:'servicio', label:'Servicios', uno:'Servicio' },
  { key:'proyecto', label:'Proyectos', uno:'Proyecto' },
  { key:'espacio',  label:'Espacios',  uno:'Espacio' }
];
var GAMAS = {
  navidad:     { label:'Navidad',     img:'images/campana/navidad-comedor-arbol.jpg', href:'catalogo-navidad' },
  muebleria:   { label:'Mueblería',   img:'images/mobiliario/centro-deluxe-1.webp',   href:'catalogo-muebleria' },
  iluminacion: { label:'Iluminación', img:'images/iluminacion/amaris-banner.jpg',     href:'catalogo-iluminacion' }
};
var ORDEN_GAMAS = ['navidad', 'muebleria', 'iluminacion'];
var AMBITOS = { retail:'Retail', hogar:'Hogar' };
var PRECIOS = [
  { key:'hasta-100',   label:'Hasta S/ 100',       min:0,    max:100 },
  { key:'100-500',     label:'S/ 100 – 500',       min:100,  max:500 },
  { key:'500-1500',    label:'S/ 500 – 1,500',     min:500,  max:1500 },
  { key:'mas-1500',    label:'Más de S/ 1,500',    min:1500, max:Infinity },
  { key:'consultar',   label:'Precio a consultar' }
];
var ORDENES = [
  { key:'',            label:'Recomendado' },
  { key:'az',          label:'Nombre (A–Z)' },
  { key:'precio-asc',  label:'Precio: menor a mayor', precio:true },
  { key:'precio-desc', label:'Precio: mayor a menor', precio:true }
];

/* facetas: qué atributo, para qué tipos y cómo se lee de cada elemento.
   tipos null = en todos los tipos (también en «Todo») */
var FACETAS = [
  { key:'cat',    label:'Categoría', tipos:null,
    de:function(it){ return it.gamas; }, etiqueta:function(v){ return GAMAS[v] ? GAMAS[v].label : v; } },
  { key:'amb',    label:'Ámbito', tipos:['servicio', 'proyecto', 'espacio'],
    de:function(it){ return it.ambito; }, etiqueta:function(v){ return AMBITOS[v] || v; } },
  { key:'sub',    label:{ producto:'Subcategoría', proyecto:'Tipo de intervención', espacio:'Tipo de espacio' }, tipos:['producto', 'proyecto', 'espacio'],
    de:function(it){ return it.sub ? [it.sub] : []; } },
  { key:'precio', label:'Precio', tipos:['producto'], fijo:true,
    de:function(it){ return [tramo(it.valor)]; }, etiqueta:function(v){ return (PRECIOS.filter(function(p){ return p.key === v; })[0] || {}).label || v; } },
  { key:'disp',   label:'Disponibilidad', tipos:['producto'],
    de:function(it){ return [it.stock > 0 ? 'si' : 'no']; }, etiqueta:function(v){ return v === 'si' ? 'Disponible' : 'Agotado'; } },
  { key:'nuevo',  label:'Novedades', tipos:['producto'], soloSi:true,
    de:function(it){ return it.nuevo ? ['si'] : []; }, etiqueta:function(){ return 'Solo novedades'; } }
];
var CLAVES = ['tipo', 'q', 'orden'].concat(FACETAS.map(function(f){ return f.key; }));

function tramo(v){
  if(v == null) return 'consultar';
  for(var i = 0; i < PRECIOS.length; i++) if(PRECIOS[i].max != null && v >= PRECIOS[i].min && v < PRECIOS[i].max) return PRECIOS[i].key;
  return 'consultar';
}
function norm(s){ return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
function num(precio){ var n = parseFloat(String(precio).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; }

/* ---------- 1. índice ----------
   f = { productos:{ linea:{ key:pieza } }, nuevos:[keys], url:fn(key),
         servicios:GD_SERVICIOS, proyectos:GD_PROYECTOS, espacios:[…] } */
function indexar(f){
  var out = [], n = 0;
  function add(it){ it.n = n++; it.texto = norm([it.titulo, it.meta, it.sub, it.desc, it.ref,
    it.gamas.map(function(g){ return GAMAS[g] ? GAMAS[g].label : g; }).join(' '), (TIPOS.filter(function(t){ return t.key === it.tipo; })[0] || {}).uno].join(' ')); out.push(it); }

  ORDEN_GAMAS.concat(Object.keys(f.productos || {}).filter(function(l){ return ORDEN_GAMAS.indexOf(l) === -1; })).forEach(function(l){
    var src = (f.productos || {})[l] || {};
    Object.keys(src).forEach(function(k){
      var p = src[k];
      add({ id:'producto:' + k, tipo:'producto', key:k, titulo:p.nombre, img:p.img, alt:p.nombre, href:f.url ? f.url(k) : k,
        gamas:[l], ambito:[], sub:p.cat, meta:p.cat, desc:p.nota || '', ref:k, precio:p.precio, valor:num(p.precio),
        stock:p.stock == null ? 1 : p.stock, nuevo:(f.nuevos || []).indexOf(k) !== -1 });
    });
  });
  (f.espacios || []).forEach(function(e){
    add({ id:'espacio:' + e.href, tipo:'espacio', titulo:e.nombre, img:e.img, alt:e.alt || e.nombre, href:e.href,
      gamas:e.gamas || [], ambito:e.ambito || [], sub:e.tipo || '', meta:e.meta + (e.piezas ? ' · ' + e.piezas + ' piezas' : ''), desc:e.alt || '', ref:e.href });
  });
  if(f.proyectos) f.proyectos.lista.forEach(function(p){
    var D = f.proyectos;
    add({ id:'proyecto:' + p.slug, tipo:'proyecto', titulo:p.nombre, img:p.galeria[0].src, alt:p.galeria[0].alt, href:D.url(p),
      gamas:p.navidad ? ['navidad'] : [], ambito:p.lineas.slice(), sub:D.TIPOS[p.tipo] || p.cat, meta:p.cat, desc:[p.sub, p.reto].join(' '), ref:p.slug, destacado:!!p.destacado });
  });
  if(f.servicios) f.servicios.lista.forEach(function(s){
    add({ id:'servicio:' + s.slug, tipo:'servicio', titulo:s.nombre, img:s.portada.src, alt:s.portada.alt, href:f.servicios.url(s),
      gamas:s.gamas || [], ambito:[s.linea], sub:'', meta:AMBITOS[s.linea] || '', desc:[s.frase, s.intro].join(' '), ref:s.slug });
  });
  return out;
}

/* ---------- 2. estado <-> URL ---------- */
function estadoVacio(){ var e = { tipo:'', q:'', orden:'' }; FACETAS.forEach(function(f){ e[f.key] = []; }); return e; }
function desdeURL(search){
  var p = new URLSearchParams(search || ''), e = estadoVacio();
  e.tipo = TIPOS.some(function(t){ return t.key === p.get('tipo'); }) ? p.get('tipo') : '';
  e.q = (p.get('q') || '').slice(0, 80);
  e.orden = ORDENES.some(function(o){ return o.key === p.get('orden'); }) ? p.get('orden') : '';
  FACETAS.forEach(function(f){ e[f.key] = (p.get(f.key) || '').split(',').filter(Boolean); });
  return limpiar(e);
}
function aURL(e){
  var p = new URLSearchParams();
  if(e.tipo) p.set('tipo', e.tipo);
  FACETAS.forEach(function(f){ if(e[f.key].length) p.set(f.key, e[f.key].join(',')); });
  if(e.q) p.set('q', e.q);
  if(e.orden) p.set('orden', e.orden);
  var s = p.toString().replace(/%2C/g, ',');
  return s ? '?' + s : '';
}
/* una faceta solo vale para su tipo: al cambiar de tipo se descarta lo que
   ya no aplica, así los filtros de una categoría no contaminan otra */
function aplica(f, tipo){ return !f.tipos || (!!tipo && f.tipos.indexOf(tipo) !== -1); }
function limpiar(e){
  FACETAS.forEach(function(f){ if(!aplica(f, e.tipo)) e[f.key] = []; });
  if(e.tipo !== 'producto' && /^precio/.test(e.orden)) e.orden = '';
  return e;
}
function activos(e){
  var n = 0; FACETAS.forEach(function(f){ n += e[f.key].length; });
  return n + (e.q ? 1 : 0);
}

/* ---------- 3. filtro ---------- */
function coincide(it, e, excepto){
  if(e.tipo && it.tipo !== e.tipo) return false;
  if(e.q){
    var palabras = norm(e.q).split(' ');
    for(var i = 0; i < palabras.length; i++) if(it.texto.indexOf(palabras[i]) === -1) return false;
  }
  for(var j = 0; j < FACETAS.length; j++){
    var f = FACETAS[j], sel = e[f.key];
    if(f.key === excepto || !sel.length) continue;
    var vals = f.de(it);
    if(!sel.some(function(v){ return vals.indexOf(v) !== -1; })) return false;   // OR dentro de la faceta, AND entre facetas
  }
  return true;
}
function filtrar(items, e){ return items.filter(function(it){ return coincide(it, e); }); }

/* conteo por tipo para las pestañas (con todos los demás filtros aplicados) */
function porTipo(items, e){
  var c = { '':0 }; TIPOS.forEach(function(t){ c[t.key] = 0; });
  var sinTipo = Object.assign({}, e, { tipo:'' });
  // en «Todo» solo valen las facetas globales; los conteos por tipo usan las mismas
  FACETAS.forEach(function(f){ if(f.tipos) sinTipo[f.key] = []; });
  items.forEach(function(it){ if(coincide(it, sinTipo)){ c['']++; c[it.tipo]++; } });
  return c;
}

/* facetas visibles para el estado: valores con conteo (sin la propia faceta) */
function facetas(items, e){
  return FACETAS.filter(function(f){ return aplica(f, e.tipo); }).map(function(f){
    var base = items.filter(function(it){ return coincide(it, e, f.key); }), cuenta = {}, orden = [];
    base.forEach(function(it){ f.de(it).forEach(function(v){ if(!(v in cuenta)){ cuenta[v] = 0; orden.push(v); } cuenta[v]++; }); });
    if(f.key === 'precio') orden = PRECIOS.map(function(p){ return p.key; }).filter(function(k){ return k in cuenta; });
    if(f.key === 'cat') orden = ORDEN_GAMAS.filter(function(k){ return k in cuenta; }).concat(orden.filter(function(k){ return ORDEN_GAMAS.indexOf(k) === -1; }));
    // lo elegido se queda visible aunque ahora cuente 0
    e[f.key].forEach(function(v){ if(!(v in cuenta)){ cuenta[v] = 0; orden.push(v); } });
    var valores = orden.map(function(v){ return { v:v, label:f.etiqueta ? f.etiqueta(v) : v, n:cuenta[v], on:e[f.key].indexOf(v) !== -1 }; });
    var label = typeof f.label === 'string' ? f.label : f.label[e.tipo] || 'Subcategoría';
    // se muestra si elegir algo cambia el resultado: un valor que ya cubre todo no sirve de filtro
    var util = e[f.key].length > 0 || valores.some(function(x){ return x.n > 0 && x.n < base.length; }) ||
      (f.soloSi && valores.length > 0) || valores.filter(function(x){ return x.n > 0; }).length > 1;
    return { key:f.key, label:label, valores:valores, util:util };
  }).filter(function(f){ return f.util; });
}

/* ---------- 4. orden ---------- */
var PESO_TIPO = { producto:0, espacio:1, proyecto:2, servicio:3 };
function ordenar(lista, e){
  var q = norm(e.q), l = lista.slice();
  function nombre(a, b){ return a.titulo.localeCompare(b.titulo, 'es', { sensitivity:'base' }); }
  if(e.orden === 'az') return l.sort(nombre);
  if(e.orden === 'precio-asc' || e.orden === 'precio-desc'){
    var s = e.orden === 'precio-asc' ? 1 : -1;
    return l.sort(function(a, b){
      if(a.valor == null && b.valor == null) return a.n - b.n;
      if(a.valor == null) return 1; if(b.valor == null) return -1;   // «a consultar» siempre al final
      return s * (a.valor - b.valor) || a.n - b.n;
    });
  }
  return l.sort(function(a, b){
    if(q){
      var sa = norm(a.titulo).indexOf(q) !== -1 ? 0 : 1, sb = norm(b.titulo).indexOf(q) !== -1 ? 0 : 1;
      if(sa !== sb) return sa - sb;
    }
    return (PESO_TIPO[a.tipo] - PESO_TIPO[b.tipo]) || ((b.destacado ? 1 : 0) - (a.destacado ? 1 : 0)) || a.n - b.n;
  });
}

function resultados(items, e){ return ordenar(filtrar(items, e), e); }

var API = { TIPOS:TIPOS, GAMAS:GAMAS, AMBITOS:AMBITOS, PRECIOS:PRECIOS, ORDENES:ORDENES, FACETAS:FACETAS, CLAVES:CLAVES,
  indexar:indexar, estadoVacio:estadoVacio, desdeURL:desdeURL, aURL:aURL, limpiar:limpiar, activos:activos, aplica:aplica,
  filtrar:filtrar, facetas:facetas, porTipo:porTipo, ordenar:ordenar, resultados:resultados, norm:norm };
if(typeof module !== 'undefined' && module.exports) module.exports = API;
if(raiz) raiz.GD_CATALOGO = API;
})(typeof window !== 'undefined' ? window : null);
