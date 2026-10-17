/* ==========================================================================
   GIANDECO — CATÁLOGO GLOBAL: interfaz (catalogo.html)
   Pinta pestañas por tipo, buscador, orden, filtros (barra lateral en
   escritorio, panel inferior en móvil), chips de filtros activos y la
   rejilla. La lógica de filtrado vive en js/gd-catalogo.js.
   El estado va en la URL (?tipo=producto&cat=navidad…): se puede compartir
   y, al volver de una ficha, el catálogo queda igual y en la misma altura.
   ========================================================================== */
(function(){
'use strict';
var C = window.GD_CATALOGO, T = window.GD_TIENDA, raiz = document.getElementById('cg');
if(!raiz || !C) return;

var $ = function(s){ return raiz.querySelector(s); };
var FL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
var X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
var IR = { servicio:'Ver servicio', proyecto:'Ver proyecto', espacio:'Ver espacio' };
var K_SCROLL = 'gd.cg.scroll';
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function plural(n, uno, varios){ return n + ' ' + (n === 1 ? uno : varios); }

var items, e;
try{
  items = C.indexar({
    productos:{ navidad:window.GD_NAVIDAD || {}, muebleria:window.GD_PRODUCTOS || {}, iluminacion:window.GD_ILUMINACION || {} },
    nuevos:window.GD_NUEVOS || [], url:function(k){ return window.GD_URL ? window.GD_URL(k) : 'producto?p=' + k; },
    servicios:window.GD_SERVICIOS, proyectos:window.GD_PROYECTOS, espacios:T ? T.ESPACIOS : []
  });
  if(!items.length) throw new Error('vacío');
} catch(err){
  $('#cgGrid').removeAttribute('aria-busy');
  $('#cgGrid').innerHTML = '';
  $('#cgEstado').innerHTML = '<p class="cg-estado-t">No pudimos cargar el catálogo.</p><p>Revise su conexión e inténtelo de nuevo.</p>' +
    '<button type="button" class="gd-btn gd-btn-primary" onclick="location.reload()">Reintentar</button>';
  $('#cgEstado').hidden = false;
  return;
}
e = C.desdeURL(location.search);

/* ---------- tarjetas ---------- */
function tarjeta(it){
  if(it.tipo === 'producto' && T && T.CAT[it.key]) return T.card(it.key);
  var tipo = (C.TIPOS.filter(function(t){ return t.key === it.tipo; })[0] || {}).uno || '';
  var meta = it.tipo === 'proyecto' ? it.sub : it.tipo === 'espacio' ? it.sub + ' · ' + (it.ambito[0] ? C.AMBITOS[it.ambito[0]] : '') : it.meta;
  return '<article class="cg-card es-' + it.tipo + '"><a class="gd-prod" href="' + esc(it.href) + '">' +
    '<span class="gd-prod-thumb es-foto"><span class="cg-tipo">' + esc(tipo) + '</span><img decoding="async" loading="lazy" src="' + esc(it.img) + '" alt="' + esc(it.alt) + '"></span>' +
    '<span class="gd-prod-cat">' + esc(meta) + '</span><span class="gd-prod-name">' + esc(it.titulo) + '</span>' +
    (it.tipo === 'producto' ? '<span class="gd-prod-price">' + esc(it.precio) + '</span>' : '<span class="cg-ir">' + (IR[it.tipo] || 'Ver') + FL + '</span>') +
    '</a></article>';
}

/* ---------- filtros ---------- */
function grupoHTML(f){
  var abierto = f.valores.some(function(v){ return v.on; }) || ['cat', 'sub', 'precio'].indexOf(f.key) !== -1;
  return '<details class="cg-grupo"' + (abierto ? ' open' : '') + '><summary>' + esc(f.label) +
    (f.valores.filter(function(v){ return v.on; }).length ? ' <b>' + f.valores.filter(function(v){ return v.on; }).length + '</b>' : '') + '</summary>' +
    '<ul>' + f.valores.map(function(v){
      var id = 'cg-' + f.key + '-' + C.norm(v.v).replace(/[^a-z0-9]+/g, '-');
      return '<li><input type="checkbox" id="' + id + '" data-f="' + f.key + '" value="' + esc(v.v) + '"' + (v.on ? ' checked' : '') + (v.n === 0 && !v.on ? ' disabled' : '') + '>' +
        '<label for="' + id + '"><span>' + esc(v.label) + '</span><small>' + v.n + '</small></label></li>';
    }).join('') + '</ul></details>';
}
function chipsHTML(F){
  var h = '';
  F.forEach(function(f){ f.valores.forEach(function(v){
    if(v.on) h += '<button type="button" class="cg-chip" data-quitar="' + f.key + '" data-v="' + esc(v.v) + '" aria-label="Quitar filtro ' + esc(v.label) + '">' + esc(v.label) + X + '</button>';
  }); });
  if(e.q) h += '<button type="button" class="cg-chip" data-quitar="q" aria-label="Quitar búsqueda ' + esc(e.q) + '">«' + esc(e.q) + '»' + X + '</button>';
  if(h) h += '<button type="button" class="cg-limpiar" data-limpiar>Limpiar todo</button>';
  return h;
}

/* ---------- pintar ---------- */
var primera = true;
function pintar(){
  var res = C.resultados(items, e), F = C.facetas(items, e), cuenta = C.porTipo(items, e), n = C.activos(e);

  // pestañas por tipo
  $('#cgTipos').innerHTML = [{ key:'', label:'Todo' }].concat(C.TIPOS).map(function(t){
    var on = e.tipo === t.key;
    return '<button type="button" data-tipo="' + t.key + '" aria-pressed="' + on + '"' + (on ? ' class="is-on"' : '') + (!cuenta[t.key] && !on ? ' disabled' : '') + '>' +
      esc(t.label) + ' <small>' + cuenta[t.key] + '</small></button>';
  }).join('');
  // accesos a gamas: atajo del filtro Categoría
  raiz.querySelectorAll('[data-gama]').forEach(function(b){ var on = e.cat.length === 1 && e.cat[0] === b.dataset.gama; b.setAttribute('aria-pressed', on); b.classList.toggle('is-on', on); });

  $('#cgGrupos').innerHTML = F.length ? F.map(grupoHTML).join('') : '<p class="cg-nada">No hay filtros para esta selección.</p>';
  var chips = chipsHTML(F); $('#cgChips').innerHTML = chips; $('#cgChips').hidden = !chips;
  $('#cgN').textContent = n ? n : ''; $('#cgN').hidden = !n;
  $('#cgCuenta').textContent = plural(res.length, 'resultado', 'resultados');
  $('#cgVer').textContent = 'Ver ' + plural(res.length, 'resultado', 'resultados');
  $('#cgLimpiarPanel').disabled = !n;

  // orden: los de precio solo con productos
  var sel = $('#cgOrden');
  sel.innerHTML = C.ORDENES.filter(function(o){ return !o.precio || e.tipo === 'producto'; }).map(function(o){
    return '<option value="' + o.key + '"' + (o.key === e.orden ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('');
  if($('#cgQ').value !== e.q && document.activeElement !== $('#cgQ')) $('#cgQ').value = e.q;

  var grid = $('#cgGrid');
  grid.removeAttribute('aria-busy');
  grid.innerHTML = res.map(tarjeta).join('');
  var vacio = $('#cgEstado');
  if(res.length){ vacio.hidden = true; vacio.innerHTML = ''; }
  else {
    vacio.innerHTML = '<p class="cg-estado-t">Nada coincide con esta combinación.</p>' +
      '<p>' + (e.q ? 'Pruebe otra palabra o quite un filtro.' : 'Quite un filtro para ver más opciones.') + '</p>' +
      '<div class="cg-estado-acc">' + (n ? '<button type="button" class="gd-btn gd-btn-primary" data-limpiar>Limpiar filtros</button>' : '') +
      (e.tipo ? '<button type="button" class="gd-btn gd-btn-ghost" data-tipo="">Ver todo el catálogo</button>' : '') + '</div>';
    vacio.hidden = false;
  }

  var url = location.pathname + C.aURL(e);
  if(url !== location.pathname + location.search) history.replaceState(null, '', url);
  if(primera){ primera = false; volverAltura(); }
}

/* ---------- cambios de estado ---------- */
function cambiar(fn){ fn(); C.limpiar(e); pintar(); }
raiz.addEventListener('click', function(ev){
  var b = ev.target.closest('button, a'); if(!b) return;
  if(b.hasAttribute('data-tipo')) return cambiar(function(){ e.tipo = b.getAttribute('data-tipo'); e.sub = []; });
  if(b.hasAttribute('data-gama')) return cambiar(function(){ var g = b.dataset.gama; e.cat = e.cat.length === 1 && e.cat[0] === g ? [] : [g]; e.sub = []; });
  if(b.hasAttribute('data-quitar')) return cambiar(function(){
    var k = b.getAttribute('data-quitar'); if(k === 'q'){ e.q = ''; $('#cgQ').value = ''; } else e[k] = e[k].filter(function(v){ return v !== b.dataset.v; });
  });
  if(b.hasAttribute('data-limpiar')) return cambiar(function(){ var t = e.tipo, o = e.orden; e = C.estadoVacio(); e.tipo = t; e.orden = o; $('#cgQ').value = ''; });
  if(b.id === 'cgAbrir') return abrir();
  if(b.hasAttribute('data-cerrar')) return cerrar();
  // al abrir una ficha se guarda la altura para volver al mismo punto
  if(b.matches('#cgGrid a')) try{ sessionStorage.setItem(K_SCROLL, JSON.stringify({ q:location.search, y:window.scrollY })); }catch(x){}
});
raiz.addEventListener('change', function(ev){
  var t = ev.target;
  if(t.matches('input[data-f]')) return cambiar(function(){
    var k = t.dataset.f; e[k] = t.checked ? e[k].concat(t.value) : e[k].filter(function(v){ return v !== t.value; });
    if(k === 'cat') e.sub = e.sub.filter(function(s){ return items.some(function(it){ return it.sub === s && (!e.cat.length || it.gamas.some(function(g){ return e.cat.indexOf(g) !== -1; })); }); });
  });
  if(t.id === 'cgOrden') return cambiar(function(){ e.orden = t.value; });
});
var espera;
$('#cgQ').addEventListener('input', function(){ var v = this.value; clearTimeout(espera); espera = setTimeout(function(){ cambiar(function(){ e.q = v.trim().slice(0, 80); }); }, 180); });
$('#cgBuscar').addEventListener('submit', function(ev){ ev.preventDefault(); clearTimeout(espera); var v = $('#cgQ').value; cambiar(function(){ e.q = v.trim().slice(0, 80); }); $('#cgQ').blur(); });

/* ---------- panel de filtros en móvil ---------- */
var mq = window.matchMedia('(max-width:1023px)'), panel = $('#cgFiltros'), velo = $('#cgVelo'), volverA = null;
function abrir(){
  volverA = document.activeElement;
  panel.classList.add('is-open'); velo.hidden = false; document.documentElement.classList.add('cg-bloqueo');
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
  $('#cgAbrir').setAttribute('aria-expanded', 'true');
  setTimeout(function(){ panel.querySelector('.cg-panel-x').focus(); }, 30);
}
function cerrar(){
  if(!panel.classList.contains('is-open')) return;
  panel.classList.remove('is-open'); velo.hidden = true; document.documentElement.classList.remove('cg-bloqueo');
  panel.removeAttribute('role'); panel.removeAttribute('aria-modal');
  $('#cgAbrir').setAttribute('aria-expanded', 'false');
  if(volverA && volverA.focus) volverA.focus();
}
velo.addEventListener('click', cerrar);
document.addEventListener('keydown', function(ev){
  if(!panel.classList.contains('is-open')) return;
  if(ev.key === 'Escape') return cerrar();
  if(ev.key === 'Tab'){   // el foco no sale del panel abierto
    var f = panel.querySelectorAll('button:not([disabled]), input:not([disabled]), summary');
    if(!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if(ev.shiftKey && document.activeElement === a){ ev.preventDefault(); z.focus(); }
    else if(!ev.shiftKey && document.activeElement === z){ ev.preventDefault(); a.focus(); }
  }
});
function alCambiar(){ if(!mq.matches) cerrar(); }
if(mq.addEventListener) mq.addEventListener('change', alCambiar); else if(mq.addListener) mq.addListener(alCambiar);

/* ---------- volver de una ficha a la misma altura ---------- */
function volverAltura(){
  var g = null; try{ g = JSON.parse(sessionStorage.getItem(K_SCROLL) || 'null'); sessionStorage.removeItem(K_SCROLL); }catch(x){}
  if(g && g.q === location.search) requestAnimationFrame(function(){ window.scrollTo(0, g.y); });
}

pintar();
})();
