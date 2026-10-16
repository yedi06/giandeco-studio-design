/* ==========================================================================
   GIANDECO — COMPONENTES DE PROYECTO
   Tarjeta, rejilla con filtros, migas y ficha completa. Solo arman HTML a
   partir de GD_PROYECTOS, así sirven en el navegador (listados) y en Node
   (hacer-proyectos.js escribe las fichas ya renderizadas, buenas para SEO).
   ========================================================================== */
(function(raiz){
'use strict';

function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
var FLECHA = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
var WA = 'https://wa.me/51920775559?text=';

/* ---------- tarjeta: la imagen manda; texto mínimo ---------- */
function card(D, p, o){
  o = o || {};
  var g = p.galeria[0];
  return '<a class="pj-card' + (o.grande ? ' es-grande' : '') + '" href="' + D.url(p) + '" data-tipo="' + p.tipo + '">' +
    '<span class="pj-card-img"><img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async"></span>' +
    '<span class="pj-card-txt"><span class="pj-card-cat">' + esc(D.TIPOS[p.tipo] || p.cat) + '</span>' +
    '<span class="pj-card-nom">' + esc(p.nombre) + '</span>' +
    (o.sub && p.sub ? '<span class="pj-card-sub">' + esc(p.sub) + '</span>' : '') + '</span></a>';
}

/* ---------- rejilla con filtros por tipo (solo los tipos que existen) ---------- */
function rejilla(D, lista, o){
  o = o || {};
  var tipos = [];
  lista.forEach(function(p){ if(tipos.indexOf(p.tipo) === -1) tipos.push(p.tipo); });
  var filtros = o.filtros && tipos.length > 1
    ? '<div class="pj-filtros" role="group" aria-label="Filtrar proyectos"><button type="button" class="is-on" aria-pressed="true" data-pj-tipo="">Todos <b>' + lista.length + '</b></button>' +
      tipos.map(function(t){ var n = lista.filter(function(p){ return p.tipo === t; }).length;
        return '<button type="button" aria-pressed="false" data-pj-tipo="' + t + '">' + esc(D.TIPOS[t]) + ' <b>' + n + '</b></button>'; }).join('') + '</div>'
    : '';
  return filtros + '<div class="pj-grid">' + lista.map(function(p, i){ return card(D, p, { grande:o.destacarPrimero && i === 0, sub:o.sub }); }).join('') + '</div>';
}

/* ---------- migas ---------- */
function migas(items){
  return '<nav class="gd-migas pj-migas" aria-label="Ruta">' + items.map(function(it, i){
    return i === items.length - 1 ? '<span aria-current="page">' + esc(it[0]) + '</span>' : '<a href="' + it[1] + '">' + esc(it[0]) + '</a>';
  }).join(' / ') + '</nav>';
}

/* ---------- ficha de proyecto ---------- */
function ficha(D, p){
  var L = D.LINEAS[p.lineas[0]], portada = p.galeria[0], resto = p.galeria.slice(1);
  var rel = D.relacionados(p, 3);
  var msg = WA + encodeURIComponent('Hola Giandeco, vi el proyecto ' + p.nombre + ' en su web y quiero conversar sobre un proyecto similar.');
  var h = '';
  // 1. portada
  h += '<section class="pj-hero"><img src="' + esc(portada.src) + '" alt="' + esc(portada.alt) + '" fetchpriority="high" decoding="async">' +
    '<div class="gd-in pj-hero-txt">' + migas([['Inicio', './'], [L.label, L.href], ['Proyectos', L.proyectos], [p.nombre]]) +
      '<p class="gd-eyebrow">' + esc(p.cat) + '</p><h1>' + esc(p.nombre) + '</h1>' + (p.sub ? '<p class="pj-hero-sub">' + esc(p.sub) + '</p>' : '') + '</div></section>';
  // 2. contexto: el encargo, en una frase, y la ficha técnica
  h += '<section class="gd-sec pj-intro"><div class="gd-in pj-intro-grid">' +
    '<div><p class="pj-etq">El encargo</p><p class="pj-lead">' + esc(p.reto) + '</p></div>' +
    '<dl class="pj-datos"><div><dt>Línea</dt><dd>' + p.lineas.map(function(l){ return '<a href="' + D.LINEAS[l].href + '">' + D.LINEAS[l].label + '</a>'; }).join(' · ') + '</dd></div>' +
      '<div><dt>Tipo</dt><dd>' + esc(D.TIPOS[p.tipo]) + '</dd></div>' +
      (p.navidad ? '<div><dt>Temporada</dt><dd><a href="retail-navidad">Navidad</a></dd></div>' : '') + '</dl></div></section>';
  // 3. galería (si hay más de una foto)
  if(resto.length) h += '<section class="pj-galeria" aria-label="Galería"><div class="gd-in"><div class="pj-gal pj-gal-' + Math.min(resto.length, 3) + '">' +
    resto.map(function(g){ return '<button type="button" class="pj-foto" data-ampliar aria-label="Ampliar: ' + esc(g.alt) + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async"></button>'; }).join('') + '</div></div></section>';
  // 4. proceso (boceto → obra)
  if(p.proceso && p.proceso.length) h += '<section class="gd-sec pj-proceso"><div class="gd-in"><p class="pj-etq">Proceso</p><h2 class="pj-h2">Del papel a la obra</h2>' +
    '<ol class="pj-pasos">' + p.proceso.map(function(g, i){ return '<li><button type="button" class="pj-foto" data-ampliar aria-label="Ampliar: ' + esc(g.alt) + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async"></button><span><b>0' + (i + 1) + '</b>' + esc(g.etapa || '') + '</span></li>'; }).join('') + '</ol></div></section>';
  // 5. qué hicimos y resultado
  h += '<section class="gd-sec pj-texto"><div class="gd-in pj-texto-grid">' +
    '<div><p class="pj-etq">Qué hicimos</p><p class="pj-p">' + esc(p.hice) + '</p></div>' +
    '<div class="pj-res"><p class="pj-etq">Resultado</p><p class="pj-res-txt">' + esc(p.res) + '</p>' +
      (p.espacio ? '<a class="gd-link" href="' + p.espacio + '">Compre las piezas de este espacio' + FLECHA + '</a>' : '') + '</div></div></section>';
  // 6. relacionados
  if(rel.length) h += '<section class="gd-sec pj-rel"><div class="gd-in"><div class="pj-rel-head"><h2 class="pj-h2">Más proyectos</h2><a class="gd-link" href="' + L.proyectos + '">Ver todos' + FLECHA + '</a></div>' +
    '<div class="pj-grid es-3">' + rel.map(function(r){ return card(D, r); }).join('') + '</div></div></section>';
  // 7. una sola acción principal
  h += '<section class="gd-sec pj-cta"><div class="gd-in"><h2 class="pj-h2">¿Un proyecto así para su marca o su casa?</h2>' +
    '<div class="pj-cta-acc"><a class="gd-btn gd-btn-primary" href="' + msg + '" target="_blank" rel="noopener">Hablemos de su proyecto' + FLECHA + '</a>' +
    '<a class="gd-link" href="contacto">Otras formas de contacto' + FLECHA + '</a></div></div></section>';
  return h;
}

var API = { esc:esc, card:card, rejilla:rejilla, migas:migas, ficha:ficha };
if(typeof module !== 'undefined' && module.exports) module.exports = API;
if(raiz) raiz.GD_PJ = API;

/* ---------- navegador: filtros y ampliación de fotos ---------- */
if(typeof document !== 'undefined'){
  document.addEventListener('click', function(e){
    var f = e.target.closest && e.target.closest('[data-pj-tipo]');
    if(f){
      var cont = f.closest('.pj-filtros'), grid = cont.nextElementSibling, t = f.getAttribute('data-pj-tipo');
      cont.querySelectorAll('button').forEach(function(b){ var on = b === f; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      grid.querySelectorAll('.pj-card').forEach(function(c){ c.hidden = !!t && c.getAttribute('data-tipo') !== t; });
      return;
    }
    var a = e.target.closest && e.target.closest('[data-ampliar]');
    if(a && window.GD_AMPLIAR) window.GD_AMPLIAR(a.querySelector('img'));
  });
}
})(typeof window !== 'undefined' ? window : null);
