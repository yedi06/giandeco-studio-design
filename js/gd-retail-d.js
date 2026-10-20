/* ==========================================================================
   RETAIL · PROPUESTA D «PLANO» — comportamiento
   · marcas en movimiento (carrusel por JS)
   · plano con 6 zonas: elegir una, agregarla al montaje, pedir la propuesta por WhatsApp
   · servicios (pestañas / acordeón) y paquetes (pestañas en móvil)
   Las fotos de cada zona se cargan al elegirla (y la siguiente/anterior en reposo).
   ========================================================================== */
(function(){
  'use strict';
  var WA = '51920775559';
  var raiz = document.querySelector('.rd');
  if(!raiz) return;
  function $(s, c){ return (c || raiz).querySelector(s); }
  function $$(s, c){ return Array.prototype.slice.call((c || raiz).querySelectorAll(s)); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  /* ---------- marcas en movimiento ---------- */
  (function(){
    var mq = $('.rd-mq'); if(!mq) return;
    var movimiento = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    mq.innerHTML = mq.innerHTML + mq.innerHTML;        // dos vueltas seguidas: el salto al reiniciar no se nota
    mq.querySelectorAll('span:nth-child(n+' + (mq.children.length / 2 + 1) + ') img').forEach(function(i){ i.alt = ''; });
    if(!movimiento) return;
    var x = 0, last = 0, speed = 42, visible = true;
    if('IntersectionObserver' in window) new IntersectionObserver(function(e){ visible = e[0].isIntersecting; }, { rootMargin:'200px' }).observe(mq);
    function tick(t){
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      if(visible){
        var half = mq.scrollWidth / 2;
        if(half > 0){ x = (x + speed * dt) % half; mq.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)'; }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- plano ---------- */
  var Z = [
    { name:'Vitrina y entrada', tienda:'Ferrehome', img:'vitrina', oy:'45%', alt:'Vitrina de cristal con casitas de jengibre y nieve en Ferrehome',
      desc:'Detiene al que pasa. Casitas de jengibre, nieve y luz en una vitrina de cristal, a la vista desde la vereda.',
      items:['Vitrina de casitas','Nieve y luz cálida','Piezas héroe de su inventario'], l:'4%', t:'80%', w:'92%', h:'9%', r:'2px' },
    { name:'Isla central', tienda:'SuperHome', img:'isla', oy:'50%', alt:'Mesa servida borgoña y dorado con velas y florales en SuperHome',
      desc:'La mesa que se vende completa: vajilla, copas, velas y florales armados como una cena servida.',
      items:['Mesa escenográfica con su vajilla','Florales y velas','Paleta borgoña y dorado'], l:'33%', t:'42%', w:'34%', h:'19%', r:'2px' },
    { name:'Árbol de marca', tienda:'Ferrehome', img:'arbol', oy:'40%', alt:'Árbol rojo y blanco con Papá Noel en Ferrehome',
      desc:'Un árbol temático a lo largo del recorrido. Rojo y blanco, con Papá Noel al pie, visible desde el ingreso.',
      items:['Árbol temático de marca','Figura héroe al pie','Guía de reposición'], l:'6%', t:'6%', w:'21%', h:'17%', r:'50%' },
    { name:'Pared y góndola', tienda:'SuperHome', img:'pared', oy:'60%', alt:'Nacimiento blanco y dorado sobre la estantería de SuperHome',
      desc:'El producto de la estantería hecho escena. Un nacimiento blanco y oro como pieza héroe de la pared.',
      items:['Nacimiento como pieza héroe','Agrupación por color','Producto de la propia góndola'], l:'33%', t:'4%', w:'62%', h:'11%', r:'2px' },
    { name:'Rincón de caja', tienda:'Ferrehome', img:'rincon', oy:'50%', alt:'Rincón con ciervos blancos, Papá Noel y flores rojas sobre mesa de vidrio',
      desc:'Un rincón de foto junto a caja: ciervos, Papá Noel y flores sobre una mesa de vidrio. El cliente se queda y lo comparte.',
      items:['Rincón foto','Mesa de vidrio con piezas héroe','Pensado para redes'], l:'70%', t:'64%', w:'24%', h:'16%', r:'2px' },
    { name:'Taller en tienda', tienda:'SuperHome', img:'taller', oy:'30%', alt:'Gian arma una mesa navideña en vivo durante el taller en SuperHome',
      desc:'Gian arma la mesa en vivo, con la tienda abierta. Es el evento que trae gente nueva al local.',
      items:['Taller dirigido por Gian','Mesa servida en vivo','Contenido para redes'], l:'70%', t:'24%', w:'24%', h:'30%', r:'2px' }
  ];
  var cur = 1, sel = [false, true, false, false, false, false];
  var base = 'images/retail-navidad/';
  var CHK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';

  var plano = $('.rd-plano'), legend = $('.rd-legend'), stage = $('.rd-stage'), slots = $('.rd-slots');
  if(plano){
    plano.insertAdjacentHTML('beforeend', Z.map(function(z, i){
      return '<button type="button" class="rd-zone" data-z="' + i + '" aria-label="' + esc(z.name) + '" style="left:' + z.l + ';top:' + z.t + ';width:' + z.w + ';height:' + z.h + ';border-radius:' + z.r + '">' +
        '<span class="rd-pin"><span class="rd-ring"></span><span class="rd-num">' + (i + 1) + '</span></span></button>';
    }).join(''));
    legend.innerHTML = Z.map(function(z, i){
      return '<button type="button" class="rd-lg" data-z="' + i + '"><i>' + (i + 1) + '</i><b>' + esc(z.name) + '</b>' + CHK + '</button>';
    }).join('');
    stage.insertAdjacentHTML('afterbegin', Z.map(function(z, i){
      return '<img data-z="' + i + '" data-src="' + base + z.img + '.webp" alt="' + esc(z.alt) + '" decoding="async" width="1200" height="1500">';
    }).join(''));
    slots.innerHTML = Z.map(function(z, i){ return '<div class="rd-slot" data-z="' + i + '"><span>' + (i + 1) + '</span></div>'; }).join('');
  }

  function carga(i){
    var im = $('.rd-stage img[data-z="' + i + '"]');
    if(im && !im.getAttribute('src')) im.src = im.getAttribute('data-src');
  }
  function paquete(n){
    if(n === 1) return 'Punto Navidad';
    if(n >= 2 && n <= 4 && !(sel[5] && n >= 3)) return 'Tienda en Navidad';
    if(n >= 2) return 'Temporada completa';
    return 'Elija al menos una zona';
  }
  function pinta(){
    var z = Z[cur], on = sel[cur];
    $$('.rd-zone').forEach(function(b, i){
      b.classList.toggle('is-on', sel[i]); b.classList.toggle('is-cur', i === cur);
      b.style.border = '1px ' + (i === cur ? 'solid' : 'dashed') + ' ' + (i === cur ? '#C9A24A' : 'rgba(201,162,74,.55)');
      b.style.background = sel[i] ? 'rgba(201,162,74,.30)' : (i === cur ? 'rgba(201,162,74,.16)' : 'rgba(201,162,74,.04)');
      b.setAttribute('aria-pressed', sel[i] ? 'true' : 'false');
    });
    $$('.rd-lg').forEach(function(b, i){ b.classList.toggle('is-cur', i === cur); b.classList.toggle('is-on', sel[i]); b.setAttribute('aria-pressed', sel[i] ? 'true' : 'false'); });
    carga(cur);
    $$('.rd-stage img').forEach(function(im){ im.classList.toggle('is-cur', +im.getAttribute('data-z') === cur); im.style.objectPosition = '50% ' + Z[+im.getAttribute('data-z')].oy; });
    $('.rd-stage-tienda').textContent = z.tienda;
    $('.rd-stage-n').textContent = '0' + (cur + 1);
    $('.rd-zname').textContent = z.name;
    $('.rd-zdesc').textContent = z.desc;
    $('.rd-zlist').innerHTML = z.items.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('');
    var btn = $('.rd-zbtn'); btn.textContent = on ? 'Quitar de mi montaje' : 'Agregar a mi montaje'; btn.classList.toggle('is-on', on);
    var names = Z.filter(function(_, i){ return sel[i]; }).map(function(x){ return x.name; });
    var n = names.length, pack = paquete(n);
    var count = n === 0 ? 'Ninguna zona elegida' : (n === 1 ? '1 zona elegida' : n + ' zonas elegidas');
    var msg = n === 0 ? 'Hola Giandeco, quiero armar el montaje de Navidad de mi tienda.'
      : 'Hola Giandeco, quiero armar el montaje de Navidad de mi tienda. Zonas: ' + names.join(', ') + '. Paquete sugerido: ' + pack + '.';
    var href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    $$('.rd-sum-count').forEach(function(e){ e.textContent = count; });
    $$('.rd-sum-pack').forEach(function(e){ e.textContent = pack; });
    $$('.rd-sum-wa').forEach(function(e){ e.href = href; });
    $$('.rd-slot').forEach(function(s, i){
      var im = s.querySelector('img');
      if(sel[i] && !im){ s.insertAdjacentHTML('beforeend', '<img src="' + base + Z[i].img + '.webp" alt="" decoding="async" loading="lazy">'); }
      else if(!sel[i] && im){ im.remove(); }
    });
  }
  function ir(i){ cur = (i + Z.length) % Z.length; pinta(); }
  if(plano){
    raiz.addEventListener('click', function(e){
      var b = e.target.closest('[data-z]'); if(b && (b.classList.contains('rd-zone') || b.classList.contains('rd-lg'))){ ir(+b.getAttribute('data-z')); return; }
      if(e.target.closest('.rd-zbtn')){ sel[cur] = !sel[cur]; pinta(); return; }
      if(e.target.closest('.rd-prev')){ ir(cur - 1); return; }
      if(e.target.closest('.rd-next')){ ir(cur + 1); return; }
    });
    pinta();
    // precarga en reposo la zona siguiente y la anterior
    (window.requestIdleCallback || function(f){ setTimeout(f, 1500); })(function(){ carga((cur + 1) % Z.length); carga((cur + Z.length - 1) % Z.length); });
  }

  /* ---------- servicios ---------- */
  var svItems = $$('.rd-sv-item'), svPics = $$('.rd-sv-pic');
  function servicio(i){
    svItems.forEach(function(it, k){ it.classList.toggle('is-on', k === i); var b = it.querySelector('.rd-sv-b'); b.setAttribute('aria-expanded', k === i ? 'true' : 'false'); });
    svPics.forEach(function(p, k){ p.classList.toggle('is-on', k === i); });
    var it = svItems[i], det = $('.rd-sv-det');
    if(det && it){
      var p = it.querySelector('.rd-sv-d p'), a = it.querySelector('.rd-sv-d a');
      det.innerHTML = '<h3 class="rd-h3">' + esc(it.getAttribute('data-t')) + '</h3><p>' + (p ? esc(p.textContent) : '') + '</p>' +
        (a ? '<a class="rd-link" href="' + a.getAttribute('href') + '">' + a.innerHTML + '</a>' : '');
    }
  }
  svItems.forEach(function(it, i){
    var b = it.querySelector('.rd-sv-b');
    b.addEventListener('click', function(){ servicio(i); });
    it.addEventListener('mouseenter', function(){ if(window.matchMedia('(min-width:900px)').matches) servicio(i); });
  });
  if(svItems.length) servicio(0);

  /* ---------- paquetes (pestañas en móvil) ---------- */
  var pkTabs = $$('.rd-pk-tabs button'), pkRows = $$('.rd-pkrow');
  function paquetes(i){ pkTabs.forEach(function(b, k){ b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); pkRows.forEach(function(r, k){ r.classList.toggle('is-on', k === i); }); }
  pkTabs.forEach(function(b, i){ b.addEventListener('click', function(){ paquetes(i); }); });
  if(pkTabs.length) paquetes(1);
})();
