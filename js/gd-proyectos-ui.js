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

/* ---------- fotos ya vistas: una foto no se repite en la misma página ----------
   usadas: lista de rutas ya mostradas; en el navegador se suman las de la página */
/* la misma foto guardada con otro nombre cuenta como la misma (comparadas por
   contenido, no por nombre): clave = archivo «principal» del grupo */
var MISMA_FOTO = {
  "images/02.jpg": "images/proceso/salon-boceto.jpg",
  "images/universos/catalogo.jpg": "images/espacios/zara-navidad-1.jpg",
  "images/posicionamiento/manifiesto.jpg": "images/shift/mural.jpg",
  "images/proyectos/expodeco-montaje.jpg": "images/shift/mural.jpg",
  "images/proceso/casacor-obra.jpg": "images/proyectos/casacor-3.jpg",
  "images/proceso/expodeco-obra.jpg": "images/shift/expodeco-stand.jpg",
  "images/espacios/expodeco-1.jpg": "images/shift/expodeco-stand.jpg",
  "images/03.jpg": "images/proceso/salon-obra.jpg",
  "images/catalogo/mesa-servida.jpg": "images/espacios/zara-comedor-1.jpg",
  "images/cta/cta-bg.jpg": "images/shift/casacor-detalle.jpg",
  "images/universos/hogar.jpg": "images/espacios/casacor-2.jpg",
  "images/estudio/gian-retrato.jpg": "images/estudio/gian.jpg",
  "images/proceso/zonatienda-obra.jpg": "images/shift/zonatienda.jpg",
  "images/work/zarasala.jpg": "images/espacios/zara-sala-1.jpg",
  "images/shift/expodeco-showroom.jpg": "images/proyectos/expodeco-2.jpg",
  "images/catalogo/navidad.jpg": "images/espacios/zara-navidad-3.jpg",
  "images/universos/retail.jpg": "images/proyectos/walon-puntahermosa.jpg",
  "images/proyectos/walon35-df.jpg": "images/proyectos/walon35-salon.jpg"
  };
function limpia(src){ var k = String(src || '').split('?')[0]; return MISMA_FOTO[k] || k; }
function vistas(extra){
  var u = {};
  (extra || []).forEach(function(s){ u[limpia(s)] = 1; });
  if(typeof document !== 'undefined') Array.prototype.forEach.call(document.querySelectorAll('img'), function(i){ u[limpia(i.getAttribute('src'))] = 1; });
  return u;
}
/* donde la foto se repetiría va el fondo de marca (ver docs/PROPUESTA_IMAGENES.md) */
function foto(g, usadas, nombre){
  var k = limpia(g.src);
  if(usadas && usadas[k]) return '<span class="gd-fondo" role="img" aria-label="' + esc(nombre) + '"></span>';
  if(usadas) usadas[k] = 1;
  return '<img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async">';
}

/* elegir n proyectos para una portada: primero los que traen foto que aún no se vio
   en la página (destacados antes), y solo si faltan, los que irían con fondo */
function elegir(lista, n, usadas){
  usadas = usadas || {};
  var orden = lista.slice().sort(function(a, b){ return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0); });
  var libres = orden.filter(function(p){ return !usadas[limpia(p.galeria[0].src)]; });
  return libres.concat(orden.filter(function(p){ return libres.indexOf(p) === -1; })).slice(0, n);
}

/* ---------- tarjeta: la imagen manda; texto mínimo ---------- */
function card(D, p, o){
  o = o || {};
  var g = p.galeria[0];
  return '<a class="pj-card' + (o.grande ? ' es-grande' : '') + '" href="' + D.url(p) + '" data-tipo="' + p.tipo + '">' +
    '<span class="pj-card-img">' + foto(g, o.usadas, p.nombre) + '</span>' +
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
  var usadas = vistas(o.usadas);
  return filtros + '<div class="pj-grid">' + lista.map(function(p, i){ return card(D, p, { grande:o.destacarPrimero && i === 0, sub:o.sub, usadas:usadas }); }).join('') + '</div>';
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
  var usadas = vistas(p.galeria.concat(p.proceso || []).map(function(g){ return g.src; }));
  var enGaleria = vistas(p.galeria.map(function(g){ return g.src; }));
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
    '<ol class="pj-pasos">' + p.proceso.map(function(g, i){
      // si la foto de esta etapa ya está en la galería, fondo de marca en vez de repetirla
      var media = enGaleria[limpia(g.src)] ? '<span class="pj-foto pj-foto-fondo"><span class="gd-fondo" role="img" aria-label="' + esc(g.etapa || g.alt) + '"></span></span>'
        : '<button type="button" class="pj-foto" data-ampliar aria-label="Ampliar: ' + esc(g.alt) + '"><img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async"></button>';
      return '<li>' + media + '<span><b>0' + (i + 1) + '</b>' + esc(g.etapa || '') + '</span></li>'; }).join('') + '</ol></div></section>';
  // 5. qué hicimos y resultado
  h += '<section class="gd-sec pj-texto"><div class="gd-in pj-texto-grid">' +
    '<div><p class="pj-etq">Qué hicimos</p><p class="pj-p">' + esc(p.hice) + '</p></div>' +
    '<div class="pj-res"><p class="pj-etq">Resultado</p><p class="pj-res-txt">' + esc(p.res) + '</p>' +
      (p.espacio ? '<a class="gd-link" href="' + p.espacio + '">Compre las piezas de este espacio' + FLECHA + '</a>' : '') + '</div></div></section>';
  // 6. relacionados
  if(rel.length) h += '<section class="gd-sec pj-rel"><div class="gd-in"><div class="pj-rel-head"><h2 class="pj-h2">Más proyectos</h2><a class="gd-link" href="' + L.proyectos + '">Ver todos' + FLECHA + '</a></div>' +
    '<div class="pj-grid es-3">' + rel.map(function(r){ return card(D, r, { usadas:usadas }); }).join('') + '</div></div></section>';
  // 7. una sola acción principal
  h += '<section class="gd-sec pj-cta"><div class="gd-in"><h2 class="pj-h2">¿Un proyecto así para su marca o su casa?</h2>' +
    '<div class="pj-cta-acc"><a class="gd-btn gd-btn-primary" href="' + msg + '" target="_blank" rel="noopener">Hablemos de su proyecto' + FLECHA + '</a>' +
    '<a class="gd-link" href="contacto">Otras formas de contacto' + FLECHA + '</a></div></div></section>';
  return h;
}

/* ---------- página de servicio: título primero, el detalle debajo ---------- */
function servicio(D, SV, s){
  var L = D.LINEAS[s.linea], portada = s.portada;
  // los proyectos donde se hizo este trabajo; sin repetir la foto de portada
  var pro = (s.proyectos || []).map(D.get).filter(Boolean), usadas = vistas([portada.src]);
  var otros = SV.de(s.linea).filter(function(x){ return x.slug !== s.slug; });
  var msg = WA + encodeURIComponent('Hola Giandeco, quiero cotizar: ' + s.nombre + '.');
  var h = '';
  h += '<section class="pj-hero"><img src="' + esc(portada.src) + '" alt="' + esc(portada.alt) + '" fetchpriority="high" decoding="async">' +
    '<div class="gd-in pj-hero-txt">' + migas([['Inicio', './'], [L.label, L.href], [s.nombre]]) +
      '<p class="gd-eyebrow">Servicio · ' + esc(L.label) + '</p><h1>' + esc(s.nombre) + '</h1><p class="pj-hero-sub">' + esc(s.frase) + '</p></div></section>';
  h += '<section class="gd-sec pj-intro"><div class="gd-in pj-intro-grid">' +
    '<div><p class="pj-etq">El servicio</p><p class="pj-lead">' + esc(s.intro) + '</p></div>' +
    '<div><p class="pj-etq">Incluye</p><ul class="sv-incluye">' + s.incluye.map(function(i){ return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div></div>' +
    (s.enlaces && s.enlaces.length ? '<div class="gd-in sv-enlaces">' + s.enlaces.map(function(e){ return '<a class="gd-link" href="' + e.href + '">' + esc(e.label) + FLECHA + '</a>'; }).join('') + '</div>' : '') +
    '</section>';
  if(pro.length) h += '<section class="gd-sec pj-rel"><div class="gd-in"><div class="pj-rel-head"><h2 class="pj-h2">Dónde lo hicimos</h2><a class="gd-link" href="' + L.proyectos + '">Todos los proyectos' + FLECHA + '</a></div>' +
    '<div class="pj-grid ' + (pro.length >= 4 ? 'es-4' : pro.length === 3 ? 'es-3' : 'es-2') + '">' + pro.map(function(p){ return card(D, p, { usadas:usadas }); }).join('') + '</div></div></section>';
  h += '<section class="gd-sec pj-cta"><div class="gd-in"><h2 class="pj-h2">¿Lo necesita para su ' + (s.linea === 'retail' ? 'local' : 'casa') + '?</h2>' +
    '<div class="pj-cta-acc"><a class="gd-btn gd-btn-primary" href="' + msg + '" target="_blank" rel="noopener">Cotizar ' + esc(s.nombre.toLowerCase()) + FLECHA + '</a></div>' +
    '<nav class="sv-otros" aria-label="Otros servicios">' + otros.map(function(x){ return '<a href="' + SV.url(x) + '">' + esc(x.nombre) + '</a>'; }).join('') + '</nav></div></section>';
  return h;
}

/* ---------- tarjeta de servicio: foto y título; el resto, al entrar ---------- */
function tarjetaServicio(SV, s, i, usadas){
  return '<a class="sv-card" href="' + SV.url(s) + '"><span class="pj-card-img">' + foto(s.portada, usadas, s.nombre) + '</span>' +
    '<span class="sv-card-txt"><b>0' + (i + 1) + '</b><span>' + esc(s.nombre) + '</span>' + FLECHA + '</span></a>';
}

var API = { esc:esc, vistas:vistas, elegir:elegir, card:card, rejilla:rejilla, migas:migas, ficha:ficha, servicio:servicio, tarjetaServicio:tarjetaServicio };
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
