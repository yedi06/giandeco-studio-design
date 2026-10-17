/* ==========================================================================
   GIANDECO — FILTROS DE COLECCIÓN (Navidad, Mueblería, Iluminación)
   Un solo componente para las tres colecciones: conserva los chips por
   categoría y las tarjetas de cada página, y suma buscador, precio, orden,
   contador y filtros activos. El estado queda en la URL
   (?cat=Jengibre&q=reno&precio=hasta-100&orden=precio-asc) para compartirlo
   y para que la home pueda enlazar una categoría directa.

   GD_COLECCION.montar({
     datos:   window.GD_NAVIDAD,          piezas de la colección
     grid:    'nvGrid', filtros:'nvFiltros', barra:'nvBarra', estado:'nvEstado',
     chip:    'nv-filtro',                clase de los chips (estilo de cada página)
     vacio:   'nv-vacio',                 clase del mensaje sin resultados
     tienda:  true                        tarjeta con «Añadir a la bolsa» (GD_TIENDA)
   })
   ========================================================================== */
(function(){
'use strict';

var PRECIOS = [
  { k:'hasta-100', t:'Hasta S/ 100',    min:0,    max:100 },
  { k:'100-500',   t:'S/ 100 – 500',    min:100,  max:500 },
  { k:'500-1500',  t:'S/ 500 – 1,500',  min:500,  max:1500 },
  { k:'mas-1500',  t:'Más de S/ 1,500', min:1500, max:Infinity },
  { k:'consultar', t:'Precio a consultar' }
];
var ORDENES = [['', 'Recomendado'], ['precio-asc', 'Precio: menor a mayor'], ['precio-desc', 'Precio: mayor a menor'], ['az', 'Nombre (A–Z)']];
var X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function norm(s){ return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
function num(p){ var n = parseFloat(String(p).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; }
function tramo(v){
  if(v == null) return 'consultar';
  for(var i = 0; i < PRECIOS.length; i++) if(PRECIOS[i].max != null && v >= PRECIOS[i].min && v < PRECIOS[i].max) return PRECIOS[i].k;
  return 'consultar';
}

function montar(o){
  var P = o.datos || {}, keys = Object.keys(P);
  var grid = document.getElementById(o.grid), filtros = document.getElementById(o.filtros);
  var barra = document.getElementById(o.barra), estado = document.getElementById(o.estado);
  if(!grid || !filtros) return;

  // una ficha vieja enlazada por ancla (#clave) lleva a su página
  var hash = (location.hash || '').replace('#', '');
  if(hash && P[hash] && window.GD_URL){ location.replace(window.GD_URL(hash)); return; }

  var items = keys.map(function(k, i){
    var p = P[k];
    return { k:k, n:i, p:p, valor:num(p.precio), texto:norm([p.nombre, p.cat, p.nota, k].join(' ')) };
  });
  var cats = [];
  items.forEach(function(it){ if(cats.indexOf(it.p.cat) === -1) cats.push(it.p.cat); });
  var tramos = PRECIOS.filter(function(r){ return items.some(function(it){ return tramo(it.valor) === r.k; }); });

  var q = new URLSearchParams(location.search);
  var e = { cat:cats.indexOf(q.get('cat')) !== -1 ? q.get('cat') : '', q:(q.get('q') || '').slice(0, 60),
            precio:tramos.some(function(r){ return r.k === q.get('precio'); }) ? q.get('precio') : '',
            orden:ORDENES.some(function(x){ return x[0] === q.get('orden'); }) ? q.get('orden') : '' };

  /* barra: buscar · precio · orden (el precio solo si hay más de un tramo) */
  if(barra) barra.innerHTML =
    '<form class="cl-buscar" role="search"><label class="sr-only" for="' + o.barra + 'Q">Buscar en la colección</label>' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.6"/><path d="M10.5 10.5L14 14"/></svg>' +
      '<input type="search" id="' + o.barra + 'Q" placeholder="Buscar pieza" autocomplete="off" enterkeyhint="search" maxlength="60"></form>' +
    (tramos.length > 1 ? '<label class="cl-sel"><span class="sr-only">Precio</span><select data-cl="precio"><option value="">Todos los precios</option>' +
      tramos.map(function(r){ return '<option value="' + r.k + '">' + esc(r.t) + '</option>'; }).join('') + '</select></label>' : '') +
    '<label class="cl-sel"><span class="sr-only">Ordenar</span><select data-cl="orden">' +
      ORDENES.map(function(x){ return '<option value="' + x[0] + '">' + esc(x[1]) + '</option>'; }).join('') + '</select></label>';
  var input = barra && barra.querySelector('input');

  filtros.setAttribute('role', 'group');
  if(!filtros.getAttribute('aria-label')) filtros.setAttribute('aria-label', 'Filtrar por categoría');

  function tarjeta(it){
    var T = window.GD_TIENDA, p = it.p;
    if(o.tienda && T && T.CAT[it.k]) return T.card(it.k);
    return '<a class="gd-prod" href="' + (window.GD_URL ? window.GD_URL(it.k) : it.k) + '" data-cursor="Ver">' +
      '<span class="gd-prod-thumb">' + (it.valor === null ? '<span class="gd-prod-badge">A consultar</span>' : '') +
        '<img decoding="async" src="' + esc(p.img) + '" alt="' + esc(p.nombre) + '" loading="lazy"></span>' +
      '<span class="gd-prod-cat">' + esc(p.cat) + '</span><span class="gd-prod-name">' + esc(p.nombre) + '</span>' +
      '<span class="gd-prod-price">' + esc(p.precio) + '</span></a>';
  }

  function pasa(it, sinCat){
    if(!sinCat && e.cat && it.p.cat !== e.cat) return false;
    if(e.precio && tramo(it.valor) !== e.precio) return false;
    if(e.q){ var w = norm(e.q).split(' '); for(var i = 0; i < w.length; i++) if(it.texto.indexOf(w[i]) === -1) return false; }
    return true;
  }
  function ordenar(l){
    if(e.orden === 'az') return l.sort(function(a, b){ return a.p.nombre.localeCompare(b.p.nombre, 'es', { sensitivity:'base' }); });
    if(e.orden === 'precio-asc' || e.orden === 'precio-desc'){
      var s = e.orden === 'precio-asc' ? 1 : -1;
      return l.sort(function(a, b){
        if(a.valor == null || b.valor == null) return (a.valor == null) - (b.valor == null) || a.n - b.n;   // «a consultar» al final
        return s * (a.valor - b.valor) || a.n - b.n;
      });
    }
    return l;
  }

  function pintar(){
    // chips: el diseño de siempre, con el número de piezas que quedan en cada categoría
    var base = items.filter(function(it){ return pasa(it, true); });
    filtros.innerHTML = [''].concat(cats).map(function(c){
      var n = c ? base.filter(function(it){ return it.p.cat === c; }).length : base.length, on = e.cat === c;
      return '<button type="button" class="' + o.chip + (on ? ' is-active' : '') + '" data-cat="' + esc(c) + '" aria-pressed="' + on + '"' + (!n && !on ? ' disabled' : '') + '>' +
        esc(c || 'Todo') + (e.q || e.precio ? ' <small>' + n + '</small>' : '') + '</button>';
    }).join('');

    var lista = ordenar(items.filter(function(it){ return pasa(it); }));
    grid.innerHTML = lista.map(tarjeta).join('');
    grid.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });

    if(barra){
      barra.querySelectorAll('select').forEach(function(s){ s.value = e[s.dataset.cl]; });
      if(input && document.activeElement !== input) input.value = e.q;
    }
    if(estado){
      var activos = '';
      if(e.q) activos += '<button type="button" class="cl-chip" data-quitar="q" aria-label="Quitar búsqueda ' + esc(e.q) + '">«' + esc(e.q) + '»' + X + '</button>';
      if(e.precio) activos += '<button type="button" class="cl-chip" data-quitar="precio" aria-label="Quitar filtro de precio">' + esc(tramos.filter(function(r){ return r.k === e.precio; })[0].t) + X + '</button>';
      if(activos || e.cat) activos += '<button type="button" class="cl-limpiar" data-cl-limpiar>Limpiar</button>';
      estado.innerHTML = '<span class="cl-cuenta" aria-live="polite">' + lista.length + (lista.length === 1 ? ' pieza' : ' piezas') + '</span>' + activos +
        (lista.length ? '' : '<p class="' + o.vacio + ' cl-vacio">Ninguna pieza coincide. <button type="button" data-cl-limpiar>Ver toda la colección</button></p>');
    } else if(!lista.length) grid.innerHTML = '<p class="' + o.vacio + '">Sin piezas en esta categoría por ahora.</p>';

    var p = new URLSearchParams();
    if(e.cat) p.set('cat', e.cat); if(e.q) p.set('q', e.q); if(e.precio) p.set('precio', e.precio); if(e.orden) p.set('orden', e.orden);
    var url = location.pathname + (p.toString() ? '?' + p.toString() : '') + location.hash;
    if(url !== location.pathname + location.search + location.hash) history.replaceState(null, '', url);
  }

  filtros.addEventListener('click', function(ev){
    var b = ev.target.closest('[data-cat]'); if(!b) return;
    e.cat = b.dataset.cat; pintar();
  });
  function limpiar(){ e.cat = ''; e.q = ''; e.precio = ''; pintar(); }
  [barra, estado].forEach(function(host){
    if(!host) return;
    host.addEventListener('click', function(ev){
      var b = ev.target.closest('button'); if(!b) return;
      if(b.hasAttribute('data-cl-limpiar')) return limpiar();
      if(b.dataset.quitar){ e[b.dataset.quitar] = ''; pintar(); }
    });
  });
  if(barra){
    barra.addEventListener('change', function(ev){ var s = ev.target; if(s.dataset.cl){ e[s.dataset.cl] = s.value; pintar(); } });
    var espera;
    input.addEventListener('input', function(){ var v = input.value; clearTimeout(espera); espera = setTimeout(function(){ e.q = v.trim().slice(0, 60); pintar(); }, 180); });
    barra.querySelector('form').addEventListener('submit', function(ev){ ev.preventDefault(); clearTimeout(espera); e.q = input.value.trim().slice(0, 60); pintar(); input.blur(); });
  }

  pintar();
  // con la capa de tienda cargada (defer), las tarjetas pasan a las del sistema: bolsa, agotado
  if(o.tienda && !window.GD_TIENDA) document.addEventListener('DOMContentLoaded', pintar);
}

window.GD_COLECCION = { montar:montar };
})();
