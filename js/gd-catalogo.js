/* ==========================================================================
   GIANDECO — CATÁLOGO CON FILTROS (escritorio y móvil)
   Una sola pieza para Todo el catálogo, Navidad, Mueblería e Iluminación.
   La página declara su colección:  <div id="gdCat" data-linea="navidad"></div>
   Los productos salen de js/giandeco.js (con los ajustes del panel admin) y,
   si está cargada, de la tienda (stock y precio numérico).
   Los filtros viven en la dirección para que cada anuncio tenga su enlace:
     catalogo-navidad?uso=mesa&tono=dorado&precio=r1,r2&orden=asc
   Para sumar una colección nueva basta una línea en LINEAS y sus piezas en
   giandeco.js; los atributos de filtro (color, espacio, luz) van en ATR.
   ========================================================================== */
(function(){
'use strict';
var raiz = document.getElementById('gdCat');
if(!raiz) return;

var LINEA_PAGINA = raiz.getAttribute('data-linea') || 'todo';

/* colecciones: clave, nombre, página.  Las que vengan (Decoración, Papel mural)
   se agregan aquí y aparecen solas en el selector. */
var LINEAS = [
  { k:'todo',        n:'Todo el catálogo', href:'catalogo/' },
  { k:'navidad',     n:'Navidad',          href:'catalogo/navidad/' },
  { k:'muebleria',   n:'Mueblería',        href:'catalogo/muebleria/' },
  { k:'iluminacion', n:'Iluminación',      href:'catalogo/iluminacion/' }
];
/* enlace aparte al final del selector (página sin filtros: ambientes completos) */
var EXTRA = { n:'Compra el espacio', d:'Ambientes completos', href:'catalogo/compra-espacio/' };
var USOS = [ ['mesa','Mesa servida'], ['aparador','Aparador o repisa'], ['vitrina','Vitrina de tienda'], ['entrada','Entrada'],
             ['sala','Sala'], ['comedor','Comedor'], ['dormitorio','Dormitorio'] ];
var TONOS = [ ['dorado','Dorado','#C39A45'], ['rojo','Rojo','#B3262C'], ['blanco','Blanco','#EFE9DC'], ['verde','Verde','#3F6B3A'],
              ['madera','Madera','#9A6B3F'], ['negro','Negro','#161514'], ['transparente','Transparente','linear-gradient(135deg,#f4f1ea,#9fb3bd)'],
              ['multicolor','Multicolor','conic-gradient(#B3262C,#C39A45,#3F6B3A,#EFE9DC,#B3262C)'] ];
var RANGOS = [ ['r1','Hasta S/ 50',0,50], ['r2','S/ 50 – 100',50,100], ['r3','S/ 100 – 300',100,300],
               ['r4','S/ 300 – 1,000',300,1000], ['r5','Más de S/ 1,000',1000,Infinity] ];
var ORDENES = [ ['rec','Recomendado'], ['asc','Precio: menor a mayor'], ['desc','Precio: mayor a menor'] ];

/* atributos para filtrar. tono (color) · uso (espacios donde luce) · luz (LED) · antes (precio regular, activa Ofertas) */
var ATR = {
  'tren-jengibre':{tono:'multicolor',uso:['aparador','vitrina']},
  'casa-jengibre':{tono:'multicolor',uso:['aparador','vitrina'],luz:1},
  'cascanueces-musicales':{tono:'rojo',uso:['aparador','vitrina']},
  'cascanueces-mecedores':{tono:'multicolor',uso:['aparador','vitrina']},
  'perritos-cascanueces':{tono:'rojo',uso:['aparador','vitrina']},
  'reno-recostado':{tono:'dorado',uso:['mesa','aparador']},
  'reno-de-pie':{tono:'dorado',uso:['mesa','aparador']},
  'reno-recostado-plato':{tono:'dorado',uso:['mesa','aparador']},
  'reno-de-pie-plato':{tono:'dorado',uso:['mesa','aparador']},
  'papa-noel':{tono:'rojo',uso:['aparador','vitrina']},
  'bombonera-caja-regalo':{tono:'rojo',uso:['mesa','aparador']},
  'bombonera-casita':{tono:'rojo',uso:['mesa','aparador']},
  'portavela-dorado':{tono:'dorado',uso:['mesa','aparador']},
  'portavela-negro':{tono:'negro',uso:['mesa','aparador']},
  'venado-mediano':{tono:'transparente',uso:['mesa','vitrina']},
  'venado-pequeno':{tono:'transparente',uso:['mesa','vitrina']},
  'casa-musical':{tono:'negro',uso:['aparador','vitrina']},
  'taza-cascanuez-roja':{tono:'rojo',uso:['mesa']},
  'taza-cascanuez':{tono:'multicolor',uso:['mesa']},
  'arbol-iluminado':{tono:'blanco',uso:['aparador','sala'],luz:1},
  'casa-iluminada-mediana':{tono:'blanco',uso:['aparador','sala'],luz:1},
  'muneco-nieve':{tono:'blanco',uso:['aparador','sala'],luz:1},
  'casa-iluminada-pequena':{tono:'blanco',uso:['aparador','sala'],luz:1},
  'arreglo-pino-berries':{tono:'verde',uso:['mesa']},
  'farol-124':{tono:'rojo',uso:['entrada','vitrina'],luz:1},
  'farol-157':{tono:'rojo',uso:['entrada','vitrina'],luz:1},
  'centro-deluxe':{tono:'madera',uso:['sala'],luz:1},
  'centro-burnie':{tono:'madera',uso:['sala']},
  'comoda-flow':{tono:'blanco',uso:['dormitorio']},
  'comedor-city12':{tono:'madera',uso:['comedor']},
  'comedor-city180':{tono:'madera',uso:['comedor']},
  'comedor-living16':{tono:'blanco',uso:['comedor']},
  'mesa-sara-canela':{tono:'madera',uso:['comedor']},
  'mesa-sara-vidrio':{tono:'blanco',uso:['comedor']},
  'ropero-bilbao-crema':{tono:'blanco',uso:['dormitorio']},
  'ropero-bilbao-rouble':{tono:'madera',uso:['dormitorio']},
  'ropero-porto-blanco':{tono:'blanco',uso:['dormitorio']},
  'ropero-porto-rouble':{tono:'madera',uso:['dormitorio']},
  'amaris':{tono:'blanco',uso:['comedor','sala'],luz:1},
  'basilea':{tono:'negro',uso:['comedor','sala']},
  'bristol':{tono:'negro',uso:['comedor','sala']},
  'lara':{tono:'negro',uso:['comedor','sala'],luz:1},
  'longer':{tono:'negro',uso:['comedor'],luz:1},
  'mady-white':{tono:'blanco',uso:['comedor','entrada']},
  'stratto':{tono:'dorado',uso:['comedor','sala'],luz:1},
  'villa':{tono:'negro',uso:['entrada','comedor'],luz:1},
  'spazio':{tono:'negro',uso:['comedor'],luz:1}
};

/* ---------- datos ---------- */
function numero(txt){
  if(txt == null) return null;
  var m = String(txt).replace(/,/g,'').match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}
function fmt(v){ return 'S/ ' + v.toLocaleString('en-US',{ minimumFractionDigits:2, maximumFractionDigits:2 }); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

var PRODS = [];
function cargar(){
  var T = window.GD_TIENDA, CAT = T && T.CAT ? T.CAT : {};
  var fuentes = [ ['navidad', window.GD_NAVIDAD], ['muebleria', window.GD_PRODUCTOS], ['iluminacion', window.GD_ILUMINACION] ];
  PRODS = [];
  fuentes.forEach(function(f){
    var L = f[1] || {};
    Object.keys(L).forEach(function(k){
      var p = L[k], a = ATR[k] || {}, t = CAT[k] || {};
      var valor = (t.valor !== undefined) ? t.valor : numero(p.precio);
      PRODS.push({
        k:k, linea:f[0], nombre:p.nombre, cat:p.cat, img:p.img, precio:p.precio,
        valor: (typeof valor === 'number' && !isNaN(valor)) ? valor : null,
        antes: a.antes || null, stock: (t.stock !== undefined ? t.stock : (p.stock !== undefined ? p.stock : 1)),
        tono:a.tono || null, uso:a.uso || [], luz:!!a.luz,
        href: (T && T.url) ? T.url(k) : (window.GD_URL ? window.GD_URL(k) : 'producto?p=' + k)
      });
    });
  });
}

/* ---------- estado (también en la dirección) ---------- */
var S = { cat:null, uso:null, tono:null, rangos:[], ofertas:false, luz:false, orden:'rec', abierto:null, hoja:false, sec:'precio' };
(function leerURL(){
  var q = new URLSearchParams(location.search);
  if(q.get('cat')) S.cat = q.get('cat');
  if(q.get('uso')) S.uso = q.get('uso');
  if(q.get('tono')) S.tono = q.get('tono');
  if(q.get('precio')) S.rangos = q.get('precio').split(',').filter(function(r){ return RANGOS.some(function(x){ return x[0] === r; }); });
  S.ofertas = q.get('ofertas') === '1'; S.luz = q.get('luz') === '1';
  if(q.get('orden') && ORDENES.some(function(o){ return o[0] === q.get('orden'); })) S.orden = q.get('orden');
})();
function escribirURL(){
  var q = new URLSearchParams(location.search);
  [['cat',S.cat],['uso',S.uso],['tono',S.tono],['precio',S.rangos.join(',')],['ofertas',S.ofertas?'1':''],['luz',S.luz?'1':''],['orden',S.orden==='rec'?'':S.orden]]
    .forEach(function(kv){ if(kv[1]) q.set(kv[0], kv[1]); else q.delete(kv[0]); });
  var s = q.toString();
  try{ history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash); }catch(e){}
}

function rangoDe(v){ for(var i = 0; i < RANGOS.length; i++){ if(v >= RANGOS[i][2] && v < RANGOS[i][3]) return RANGOS[i][0]; } return null; }
function enLinea(p){ return LINEA_PAGINA === 'todo' || p.linea === LINEA_PAGINA; }
function pasa(p, o){
  var s = o ? Object.assign({}, S, o) : S;
  if(!enLinea(p)) return false;
  if(s.cat && p.cat !== s.cat) return false;
  if(s.uso && p.uso.indexOf(s.uso) < 0) return false;
  if(s.tono && p.tono !== s.tono) return false;
  if(s.rangos.length && (p.valor === null || s.rangos.indexOf(rangoDe(p.valor)) < 0)) return false;
  if(s.ofertas && !p.antes) return false;
  if(s.luz && !p.luz) return false;
  return true;
}
function cuenta(o){ var n = 0; PRODS.forEach(function(p){ if(pasa(p, o)) n++; }); return n; }
function lista(){
  var l = PRODS.filter(function(p){ return pasa(p); });
  if(S.orden !== 'rec') l.sort(function(a, b){
    if(a.valor === null) return 1; if(b.valor === null) return -1;
    return S.orden === 'asc' ? a.valor - b.valor : b.valor - a.valor;
  });
  return l;
}
function activos(){ return (S.cat?1:0) + (S.uso?1:0) + (S.tono?1:0) + (S.rangos.length?1:0) + (S.ofertas?1:0) + (S.luz?1:0); }
function nombre(arr, k){ for(var i = 0; i < arr.length; i++){ if(arr[i][0] === k) return arr[i][1]; } return ''; }
function linea(){ for(var i = 0; i < LINEAS.length; i++){ if(LINEAS[i].k === LINEA_PAGINA) return LINEAS[i]; } return LINEAS[0]; }
function cats(){ var c = []; PRODS.forEach(function(p){ if(enLinea(p) && c.indexOf(p.cat) < 0) c.push(p.cat); }); return c; }
function piezas(n){ return n + (n === 1 ? ' pieza' : ' piezas'); }
function precioLabel(){
  if(!S.rangos.length) return '';
  if(S.rangos.length === 1) return nombre(RANGOS, S.rangos[0]);
  return S.rangos.length + ' tramos';
}
/* interruptores: solo se muestran si separan algo dentro de la colección */
function toggleUtil(key){ var o = {}; o[key] = true; var n = cuenta(Object.assign({ cat:null, uso:null, tono:null, rangos:[], ofertas:false, luz:false }, o)); var t = cuenta({ cat:null, uso:null, tono:null, rangos:[], ofertas:false, luz:false }); return n > 0 && n < t; }

/* ---------- iconos ---------- */
var CHEV = '<svg class="ctl-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>';
var CHEV_R = '<svg class="ctl-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m4.5 3 3 3-3 3"/></svg>';
var X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';
var ICO_FILTRO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/></svg>';
var MAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

/* ---------- esqueleto ---------- */
raiz.classList.add('ctl');
raiz.innerHTML =
  '<div class="gd-in ctl-head" id="piezas">' +
    '<div class="ctl-tit">' +
      '<button type="button" class="ctl-col" data-act="col" aria-haspopup="true" aria-expanded="false"></button>' +
      '<span class="ctl-n" aria-live="polite"></span>' +
      '<div class="ctl-menu ctl-menu-col" hidden></div>' +
    '</div>' +
  '</div>' +
  '<div class="ctl-bar"><div class="gd-in ctl-bar-in">' +
    '<div class="ctl-filtros" role="group" aria-label="Filtros"></div>' +
    '<label class="ctl-orden"><span>Ordenar</span><select data-act="orden">' +
      ORDENES.map(function(o){ return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></label>' +
  '</div></div>' +
  '<div class="gd-in ctl-body">' +
    '<div class="ctl-chips"></div>' +
    '<div class="ctl-grid"></div>' +
    '<div class="ctl-vacio" hidden><p class="ctl-vacio-t">Ninguna pieza reúne esa combinación</p><p>Quite un filtro o amplíe el precio.</p><button type="button" class="gd-btn gd-btn-primary" data-act="limpiar">Limpiar filtros</button></div>' +
  '</div>' +
  '<button type="button" class="ctl-pill" data-act="hoja" aria-haspopup="dialog">' + ICO_FILTRO + '<span>Filtrar</span><em hidden></em></button>' +
  '<div class="ctl-velo" data-act="cerrar-hoja" hidden></div>' +
  '<section class="ctl-hoja" role="dialog" aria-modal="true" aria-label="Filtrar" hidden>' +
    '<header class="ctl-hoja-h"><h2>Filtrar</h2><button type="button" class="ctl-x" data-act="cerrar-hoja" aria-label="Cerrar">' + X + '</button></header>' +
    '<div class="ctl-hoja-b"></div>' +
    '<footer class="ctl-hoja-f"><button type="button" class="ctl-borrar" data-act="limpiar">Borrar todo</button><button type="button" class="ctl-ver" data-act="cerrar-hoja"></button></footer>' +
  '</section>';

var $ = function(s){ return raiz.querySelector(s); };
var elCol = $('.ctl-col'), elN = $('.ctl-n'), elMenuCol = $('.ctl-menu-col'), elFil = $('.ctl-filtros'), elOrden = $('select[data-act="orden"]'),
    elChips = $('.ctl-chips'), elGrid = $('.ctl-grid'), elVacio = $('.ctl-vacio'), elPill = $('.ctl-pill'), elHoja = $('.ctl-hoja'),
    elHojaB = $('.ctl-hoja-b'), elVer = $('.ctl-ver'), elVelo = $('.ctl-velo');
var tplEditorial = document.getElementById('gdCatEditorial');

/* ---------- piezas de interfaz ---------- */
function opcionesLista(key, arr){
  return arr.map(function(o){
    var ov = {}; ov[key] = o[0]; var n = cuenta(ov), on = S[key] === o[0];
    if(!n && !on) return '';
    return '<button type="button" class="ctl-opt' + (on ? ' is-on' : '') + '" data-act="set" data-k="' + key + '" data-v="' + esc(o[0]) + '" aria-pressed="' + on + '">' +
      (key === 'tono' ? '<i class="ctl-sw" style="background:' + o[2] + '"></i>' : '') +
      '<span>' + esc(o[1]) + '</span><small>' + n + '</small></button>';
  }).join('');
}
function preciosHTML(){
  return RANGOS.map(function(r){
    var n = cuenta({ rangos:[r[0]] }), on = S.rangos.indexOf(r[0]) >= 0;
    if(!n && !on) return '';
    return '<button type="button" class="ctl-opt' + (on ? ' is-on' : '') + '" data-act="rango" data-v="' + r[0] + '" aria-pressed="' + on + '">' +
      '<span>' + esc(r[1]) + '</span><small>' + n + '</small></button>';
  }).join('');
}
function boton(key, titulo, valor, cuerpo){
  var open = S.abierto === key;
  return '<div class="ctl-f">' +
    '<button type="button" class="ctl-fbtn' + (valor ? ' is-act' : '') + (open ? ' is-open' : '') + '" data-act="abrir" data-k="' + key + '" aria-expanded="' + open + '">' +
      esc(titulo) + (valor ? ': <b>' + esc(valor) + '</b>' : '') + CHEV + '</button>' +
    (open ? '<div class="ctl-menu">' + cuerpo + '</div>' : '') +
  '</div>';
}
function toggleBtn(key, label){
  if(!toggleUtil(key) && !S[key]) return '';
  var o = {}; o[key] = true;
  return '<button type="button" class="ctl-tg' + (S[key] ? ' is-act' : '') + '" data-act="tg" data-k="' + key + '" aria-pressed="' + S[key] + '"><i></i>' + label + ' <small>' + cuenta(o) + '</small></button>';
}

function tarjeta(p){
  var badge = p.stock <= 0 ? 'Agotado' : (p.antes && p.valor ? '−' + Math.round((1 - p.valor / p.antes) * 100) + '%' : (p.valor === null ? 'A consultar' : ''));
  var precio = p.valor === null ? esc(p.precio || 'Consultar') : fmt(p.valor);
  return '<article class="ctl-card">' +
    '<div class="ctl-ph">' +
      '<a href="' + esc(p.href) + '" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" src="' + esc(p.img) + '" alt=""></a>' +
      (badge ? '<span class="ctl-bdg' + (p.antes ? ' is-of' : '') + '">' + badge + '</span>' : '') +
      (p.stock > 0 && window.GD_TIENDA ? '<button type="button" class="ctl-add" data-gdt-add="' + p.k + '" aria-label="Añadir ' + esc(p.nombre) + ' a la bolsa">' + MAS + '</button>' : '') +
    '</div>' +
    '<a class="ctl-card-a" href="' + esc(p.href) + '">' +
      '<span class="ctl-cat">' + esc(p.cat) + '</span>' +
      '<span class="ctl-nom">' + esc(p.nombre) + '</span>' +
      '<span class="ctl-pre">' + precio + (p.antes ? ' <s>' + fmt(p.antes) + '</s>' : '') + '</span>' +
    '</a>' +
  '</article>';
}

/* ---------- bloque editorial: lista y total con los precios vigentes ---------- */
function rotulo(x, v){ return (x.getAttribute('data-pre') || '') + v + (x.getAttribute('data-post') || ''); }
function porClave(k){ for(var i = 0; i < PRODS.length; i++){ if(PRODS[i].k === k) return PRODS[i]; } return null; }
function totalDe(keys){ var t = 0; keys.forEach(function(k){ var p = porClave(k); if(p && p.valor) t += p.valor; }); return t; }
function editorialHTML(){
  var box = document.createElement('div'); box.innerHTML = tplEditorial.innerHTML;
  var ol = box.querySelector('[data-ed-keys]');
  if(ol){
    var keys = ol.getAttribute('data-ed-keys').split(',');
    ol.innerHTML = keys.map(function(k){ var p = porClave(k); if(!p) return '';
      return '<li><a href="' + esc(p.href) + '">' + esc(p.nombre) + '</a><span>' + (p.valor === null ? esc(p.precio) : fmt(p.valor)) + '</span></li>'; }).join('');
    box.querySelectorAll('[data-ed-total]').forEach(function(x){ x.textContent = rotulo(x, fmt(totalDe(keys))); });
  }
  return box.innerHTML;
}
function totalesFuera(){
  var ol = tplEditorial && (function(){ var b = document.createElement('div'); b.innerHTML = tplEditorial.innerHTML; return b.querySelector('[data-ed-keys]'); })();
  if(ol){ var t = fmt(totalDe(ol.getAttribute('data-ed-keys').split(',')));
    document.querySelectorAll('[data-ed-total]').forEach(function(x){ if(!raiz.contains(x)) x.textContent = rotulo(x, t); }); }
  var n = PRODS.filter(enLinea).length;
  document.querySelectorAll('[data-cat-total]').forEach(function(x){ x.textContent = rotulo(x, n); });
}
/* enlaces del banner a la grilla o al bloque editorial: si hay filtros, se limpian primero */
document.addEventListener('click', function(e){
  var a = e.target.closest('a[href="#aparador"], a[href="#piezas"]'); if(!a || raiz.contains(a)) return;
  if(a.getAttribute('href') === '#aparador' && !document.getElementById('aparador')){ limpiar(); S.orden = 'rec'; pintar(); }
  var dest = document.getElementById(a.getAttribute('href').slice(1)); if(!dest) return;
  e.preventDefault(); dest.scrollIntoView({ behavior:'smooth', block:'start' });
  try{ history.replaceState(null, '', location.pathname + location.search + a.getAttribute('href')); }catch(_){}
});

/* ---------- pintar ---------- */
function pintar(){
  var L = lista(), n = L.length, act = activos(), lin = linea();

  // título y selector de colección
  elCol.innerHTML = '<span>' + esc(lin.n) + '</span>' + CHEV;
  elN.textContent = piezas(n);
  elMenuCol.innerHTML = LINEAS.map(function(l){
    var t = PRODS.filter(function(p){ return l.k === 'todo' || p.linea === l.k; }).length;
    return '<a class="ctl-opt' + (l.k === LINEA_PAGINA ? ' is-on' : '') + '" href="' + l.href + '"><span>' + esc(l.n) + '</span><small>' + piezas(t) + '</small></a>';
  }).join('') + '<a class="ctl-opt ctl-opt-extra" href="' + EXTRA.href + '"><span>' + EXTRA.n + '</span><small>' + EXTRA.d + '</small></a>';

  // barra de filtros (escritorio)
  elFil.innerHTML =
    boton('cat', 'Categoría', S.cat, opcionesLista('cat', cats().map(function(c){ return [c, c]; }))) +
    boton('uso', 'Espacio', S.uso ? nombre(USOS, S.uso) : '', opcionesLista('uso', USOS)) +
    boton('precio', 'Precio', precioLabel(), preciosHTML()) +
    boton('tono', 'Color', S.tono ? nombre(TONOS, S.tono) : '', opcionesLista('tono', TONOS)) +
    '<span class="ctl-sep" aria-hidden="true"></span>' +
    toggleBtn('ofertas', 'Ofertas') + toggleBtn('luz', 'Con luz LED') +
    (act ? '<button type="button" class="ctl-limpiar" data-act="limpiar">Limpiar filtros</button>' : '');
  elOrden.value = S.orden;

  // chips de filtros activos (móvil)
  var chips = [];
  if(S.cat) chips.push(['cat', S.cat]);
  if(S.uso) chips.push(['uso', nombre(USOS, S.uso)]);
  if(S.tono) chips.push(['tono', nombre(TONOS, S.tono)]);
  if(S.rangos.length) chips.push(['precio', precioLabel()]);
  if(S.ofertas) chips.push(['ofertas', 'Ofertas']);
  if(S.luz) chips.push(['luz', 'Con luz LED']);
  elChips.innerHTML = chips.map(function(c){ return '<button type="button" class="ctl-chip" data-act="quitar" data-k="' + c[0] + '" aria-label="Quitar ' + esc(c[1]) + '">' + esc(c[1]) + X + '</button>'; }).join('');
  elChips.hidden = !chips.length;

  // grilla (+ bloque editorial de la página, si lo tiene)
  var html = L.map(tarjeta);
  if(tplEditorial && !act && S.orden === 'rec' && n > 8) html.splice(8, 0, editorialHTML());
  elGrid.innerHTML = html.join('');
  elVacio.hidden = n > 0;

  // botón flotante y hoja
  var em = elPill.querySelector('em'); em.textContent = act; em.hidden = !act;
  elVer.textContent = 'Ver ' + piezas(n);
  if(!elHoja.hidden) pintarHoja();
  escribirURL();
}

function fila(key, titulo, valor, cuerpo){
  var open = S.sec === key;
  return '<div class="ctl-acc' + (open ? ' is-open' : '') + '">' +
    '<button type="button" class="ctl-acc-h" data-act="sec" data-k="' + key + '" aria-expanded="' + open + '"><span>' + titulo + '</span>' +
      '<span class="ctl-acc-v' + (valor ? ' is-set' : '') + '">' + esc(valor || 'Todos') + (open ? CHEV : CHEV_R) + '</span></button>' +
    (open ? '<div class="ctl-acc-b">' + cuerpo + '</div>' : '') +
  '</div>';
}
function pintarHoja(){
  var top = elHojaB.scrollTop, lin = linea();
  elHojaB.innerHTML =
    fila('col', 'Colección', lin.n, LINEAS.map(function(l){
      return '<a class="ctl-opt' + (l.k === LINEA_PAGINA ? ' is-on' : '') + '" href="' + l.href + '"><span>' + esc(l.n) + '</span></a>'; }).join('') +
      '<a class="ctl-opt ctl-opt-extra" href="' + EXTRA.href + '"><span>' + EXTRA.n + '</span><small>' + EXTRA.d + '</small></a>') +
    fila('orden', 'Ordenar', nombre(ORDENES, S.orden), ORDENES.map(function(o){
      return '<button type="button" class="ctl-opt' + (S.orden === o[0] ? ' is-on' : '') + '" data-act="ordenar" data-v="' + o[0] + '"><span>' + o[1] + '</span></button>'; }).join('')) +
    fila('cat', 'Categoría', S.cat, opcionesLista('cat', cats().map(function(c){ return [c, c]; }))) +
    fila('precio', 'Precio', precioLabel(), preciosHTML()) +
    fila('uso', 'Espacio', S.uso ? nombre(USOS, S.uso) : '', opcionesLista('uso', USOS)) +
    fila('tono', 'Color', S.tono ? nombre(TONOS, S.tono) : '', '<div class="ctl-tonos">' + opcionesLista('tono', TONOS) + '</div>') +
    '<div class="ctl-tgs">' + ['ofertas','luz'].map(function(k){
      if(!toggleUtil(k) && !S[k]) return '';
      var lab = { ofertas:'Ofertas', luz:'Con luz LED' }[k];
      return '<button type="button" class="ctl-sw-row' + (S[k] ? ' is-on' : '') + '" data-act="tg" data-k="' + k + '" aria-pressed="' + S[k] + '"><span>' + lab + '</span><i><b></b></i></button>';
    }).join('') + '</div>';
  elHojaB.scrollTop = top;
}

/* ---------- acciones ---------- */
function abrirHoja(v){
  elHoja.hidden = !v; elVelo.hidden = !v;
  document.documentElement.classList.toggle('ctl-lock', v);
  if(v){ pintarHoja(); requestAnimationFrame(function(){ elHoja.classList.add('is-open'); elVelo.classList.add('is-open'); }); elHoja.querySelector('.ctl-x').focus(); }
  else { elHoja.classList.remove('is-open'); elVelo.classList.remove('is-open'); elPill.focus({ preventScroll:true }); }
  S.hoja = v;
}
function limpiar(){ S.cat = S.uso = S.tono = null; S.rangos = []; S.ofertas = S.luz = false; S.abierto = null; }

raiz.addEventListener('click', function(e){
  var t = e.target.closest('[data-act]'); if(!t || !raiz.contains(t)) return;
  var a = t.getAttribute('data-act'), k = t.getAttribute('data-k'), v = t.getAttribute('data-v');
  if(a === 'col'){ var o = elMenuCol.hidden; elMenuCol.hidden = !o; elCol.setAttribute('aria-expanded', o); S.abierto = null; pintarBarra(); return; }
  if(a === 'abrir'){ S.abierto = S.abierto === k ? null : k; elMenuCol.hidden = true; elCol.setAttribute('aria-expanded', 'false'); pintar(); return; }
  if(a === 'set'){ S[k] = S[k] === v ? null : v; if(window.matchMedia('(min-width:900px)').matches) S.abierto = null; pintar(); return; }
  if(a === 'rango'){ var i = S.rangos.indexOf(v); if(i >= 0) S.rangos.splice(i, 1); else S.rangos.push(v); pintar(); return; }
  if(a === 'tg'){ S[k] = !S[k]; pintar(); return; }
  if(a === 'quitar'){ if(k === 'precio') S.rangos = []; else if(k === 'ofertas' || k === 'luz') S[k] = false; else S[k] = null; pintar(); return; }
  if(a === 'limpiar'){ limpiar(); pintar(); return; }
  if(a === 'hoja'){ abrirHoja(true); return; }
  if(a === 'cerrar-hoja'){ abrirHoja(false); return; }
  if(a === 'sec'){ S.sec = S.sec === k ? null : k; pintarHoja(); return; }
  if(a === 'ordenar'){ S.orden = v; pintar(); return; }
  if(a === 'set-aparador'){ sumarSet(t); return; }
});
function pintarBarra(){ /* solo cierra los menús de filtro sin repintar la grilla */
  raiz.querySelectorAll('.ctl-f .ctl-menu').forEach(function(m){ m.remove(); });
  raiz.querySelectorAll('.ctl-fbtn.is-open').forEach(function(b){ b.classList.remove('is-open'); b.setAttribute('aria-expanded', 'false'); });
}
elOrden.addEventListener('change', function(){ S.orden = elOrden.value; pintar(); });
document.addEventListener('click', function(e){
  if(!e.target.closest('.ctl-f') && S.abierto){ S.abierto = null; pintarBarra(); }
  if(!e.target.closest('.ctl-tit') && !elMenuCol.hidden){ elMenuCol.hidden = true; elCol.setAttribute('aria-expanded', 'false'); }
});
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  if(S.hoja) abrirHoja(false);
  if(S.abierto){ S.abierto = null; pintarBarra(); }
  if(!elMenuCol.hidden){ elMenuCol.hidden = true; elCol.setAttribute('aria-expanded', 'false'); }
});

/* conjunto completo (bloque «El aparador completo»): suma todas sus piezas */
function sumarSet(btn){
  var T = window.GD_TIENDA, keys = (btn.getAttribute('data-keys') || '').split(',').filter(Boolean);
  if(!T || !T.carrito){ location.href = btn.getAttribute('data-wa') || '#'; return; }
  keys.forEach(function(k){ T.carrito.addKey(k, 1); });
  if(T.abrir) T.abrir();
}

/* botón flotante: visible mientras se recorre la grilla */
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(es){ es.forEach(function(en){ elPill.classList.toggle('is-vis', en.isIntersecting); }); }, { rootMargin:'0px 0px -30% 0px' });
  io.observe($('.ctl-body'));
} else { elPill.classList.add('is-vis'); }

/* arranque: con la tienda ya cargada (scripts diferidos en orden) */
function arrancar(){
  cargar();
  if(S.cat && cats().indexOf(S.cat) < 0) S.cat = null;
  pintar();
  totalesFuera();
  // #piezas / #aparador: la grilla se arma después de la carga, así que se desplaza aquí
  var ancla = (location.hash || '').slice(1);
  if(ancla === 'piezas' || ancla === 'aparador'){ var d = document.getElementById(ancla); if(d) requestAnimationFrame(function(){ d.scrollIntoView({ block:'start' }); }); }
  // enlaces viejos con #pieza: van a su ficha
  var hash = (location.hash || '').replace('#', '');
  if(hash && PRODS.some(function(p){ return p.k === hash; })) location.replace(PRODS.filter(function(p){ return p.k === hash; })[0].href);
}
arrancar();
})();
