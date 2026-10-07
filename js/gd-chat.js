/* ==========================================================================
   GIANDECO — ATENCIÓN AL CLIENTE (conserjería)
   Sello flotante arrastrable + tarjeta editorial que deriva a WhatsApp.
   Sin burbujas ni diálogo simulado: un índice de motivos y un campo para
   escribir; cada opción abre WhatsApp con el mensaje ya redactado.
   Autónomo: inyecta su propio CSS y marcado, así funciona igual en el home
   (que no carga giandeco.css) y en el resto de páginas.
   ========================================================================== */
(function(){
  if(window.gdChat || !document.body) return;
  window.gdChat = true;

  var WA = '51920775559';
  var WA_VISIBLE = '+51 920 775 559';
  var MAIL = 'contacto@giandeco.com';
  var TEMAS = [
    { t: 'Diseñar o remodelar mi tienda', msg: 'Quiero diseñar o remodelar mi tienda.' },
    { t: 'Un proyecto para mi hogar',     msg: 'Tengo un proyecto para mi hogar.' },
    { t: 'Piezas del catálogo',           msg: 'Quiero consultar por piezas del catálogo.' },
    { t: 'Un stand o un evento',          msg: 'Necesito un stand o la ambientación de un evento.' }
  ];
  var M = 12; // margen mínimo contra los bordes de la ventana
  var EASE = 'cubic-bezier(.16,1,.3,1)';
  var ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  var css = ''
  + '.gdc,.gdc-panel{--e:#0A0A09;--l:#C9A24A;--li:#DED8CB;--dim:#B9B3A6;--faint:#8a8375;--hair:rgba(222,216,203,.11);'
  +   'font-family:var(--body,"Jost",system-ui,sans-serif);font-weight:300;-webkit-font-smoothing:antialiased;box-sizing:border-box}'
  + '.gdc *,.gdc-panel *{box-sizing:border-box}'

  /* ---------- sello lanzador: un solo círculo, sin contornos ---------- */
  + '.gdc{position:fixed;z-index:72;display:flex;align-items:center;gap:2px;touch-action:none;-webkit-user-select:none;user-select:none;'
  +   'opacity:0;transform:translateY(14px) scale(.94);pointer-events:none;transition:opacity .7s ease,transform .7s ' + EASE + '}'
  + '.gdc.is-in{opacity:1;transform:none;pointer-events:auto}'
  + '.gdc.is-snap{transition:left .62s cubic-bezier(.2,1.25,.32,1),top .62s cubic-bezier(.2,1.25,.32,1),transform .5s ' + EASE + '}'
  + '.gdc.is-drag{transform:scale(1.07);transition:transform .25s ' + EASE + '}'
  /* asa de arrastre: rejilla de 2 x 3 puntos, siempre visible */
  + '.gdc-grip{flex:none;display:grid;grid-template-columns:repeat(2,3.5px);gap:4px 4.5px;align-content:center;justify-content:center;'
  +   'width:24px;height:50px;cursor:grab;opacity:.75;transition:opacity .3s ease}'
  + '.gdc-grip i{width:3.5px;height:3.5px;border-radius:50%;background:var(--l);box-shadow:0 0 0 1px rgba(10,10,9,.45);transition:background-color .3s ease}'
  + '.gdc:hover .gdc-grip,.gdc.is-drag .gdc-grip{opacity:1}'
  + '.gdc.is-drag .gdc-grip i{background:#f8e7bd}'
  + '.gdc.is-drag,.gdc.is-drag .gdc-grip,.gdc.is-drag .gdc-btn{cursor:grabbing}'
  + '.gdc-btn{display:block;padding:0;margin:0;border:none;background:none;cursor:pointer;font:inherit;border-radius:50%}'
  + '.gdc-btn:focus-visible{outline:2px solid var(--l);outline-offset:3px}'
  + '.gdc-seal{position:relative;display:grid;place-items:center;width:50px;height:50px;border-radius:50%;color:var(--l);'
  +   'background:radial-gradient(130% 130% at 30% 18%,#1d1a14 0%,#0A0A09 64%);box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 0 0 1px rgba(201,162,74,.34);'
  +   'transition:color .45s ease,box-shadow .45s ease,transform .5s ' + EASE + '}'
  /* anillo de luz: un destello de latón que recorre el borde del sello */
  + '.gdc-seal::before{content:"";position:absolute;inset:-1px;border-radius:50%;'
  +   'background:conic-gradient(from 0deg,transparent 0 52%,rgba(201,162,74,.5) 74%,#f8e7bd 92%,transparent 100%);'
  +   '-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 1.8px),#000 calc(100% - 1.8px));mask:radial-gradient(farthest-side,transparent calc(100% - 1.8px),#000 calc(100% - 1.8px));'
  +   'animation:gdcSpin 4s linear infinite;transition:opacity .4s ease}'
  /* halo tenue que acompaña al destello */
  + '.gdc-seal::after{content:"";position:absolute;inset:-7px;border-radius:50%;pointer-events:none;'
  +   'background:radial-gradient(closest-side,rgba(201,162,74,.2),transparent 72%);opacity:.55;animation:gdcGlow 4s ease-in-out infinite;transition:opacity .4s ease}'
  + '@keyframes gdcSpin{to{transform:rotate(360deg)}}'
  + '@keyframes gdcGlow{0%,100%{opacity:.35}50%{opacity:.8}}'
  + '.gdc:hover .gdc-seal::before{animation-duration:1.6s}'
  + '.gdc:hover .gdc-seal,.gdc.is-drag .gdc-seal{box-shadow:0 14px 36px rgba(0,0,0,.55),inset 0 0 0 1px rgba(201,162,74,.7)}'
  + '.gdc.is-open .gdc-seal{box-shadow:0 14px 36px rgba(0,0,0,.55),inset 0 0 0 1px var(--l)}'
  + '.gdc-g,.gdc-x{position:absolute;transition:opacity .3s ease,transform .5s ' + EASE + '}'
  + '.gdc-g{font-family:var(--display,"Bodoni Moda",Georgia,serif);font-weight:400;font-size:1.62rem;line-height:1;transform:translateY(-1px)}'
  + '.gdc-x{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.3;stroke-linecap:round;opacity:0;transform:rotate(-90deg) scale(.6)}'
  + '.gdc.is-open .gdc-g{opacity:0;transform:translateY(-1px) rotate(90deg) scale(.6)}'
  + '.gdc.is-open .gdc-x{opacity:1;transform:none}'
  /* aviso numerado, como un mensaje sin leer */
  + '.gdc-badge{position:absolute;z-index:2;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;display:grid;place-items:center;'
  +   'background:var(--l);color:var(--e);font-size:11px;font-weight:500;line-height:1;font-variant-numeric:tabular-nums;box-shadow:0 0 0 2.5px #0A0A09;'
  +   'transition:transform .45s cubic-bezier(.2,1.4,.3,1),opacity .3s ease}'
  + '.gdc-badge::after{content:"";position:absolute;inset:0;border-radius:10px;border:1px solid var(--l);animation:gdcPing 2.8s ' + EASE + ' 1s infinite}'
  + '@keyframes gdcPing{0%{transform:scale(1);opacity:.8}65%,100%{transform:scale(2.1);opacity:0}}'
  + '.gdc.is-open .gdc-badge{transform:scale(0);opacity:0}'

  /* ---------- tarjeta ---------- */
  + '.gdc-panel{position:fixed;z-index:73;width:392px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow-y:auto;'
  +   'background:#0d0c0b;color:var(--li);border:none;border-radius:2px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(0,0,0,.4);'
  +   'padding:34px 34px 26px;scrollbar-width:none;opacity:0;visibility:hidden;transform:translateY(14px);'
  +   'transition:opacity .35s ease,transform .5s ' + EASE + ',visibility 0s linear .5s}'
  + '.gdc-panel::-webkit-scrollbar{display:none}'
  + '.gdc-panel.is-open{opacity:1;visibility:visible;transform:none;transition:opacity .35s ease,transform .5s ' + EASE + '}'
  + '.gdc-close{position:absolute;top:18px;right:18px;width:32px;height:32px;border:none;border-radius:50%;background:none;color:var(--faint);cursor:pointer;display:grid;place-items:center;transition:color .25s ease,transform .45s ' + EASE + '}'
  + '.gdc-close:hover{color:var(--l);transform:rotate(90deg)}'
  + '.gdc-close:focus-visible{outline:1px solid var(--l);outline-offset:2px}'
  + '.gdc-close svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.2;stroke-linecap:round}'
  + '.gdc-eyebrow{margin:0 0 18px;font-size:.6rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:var(--l)}'
  + '.gdc-title{margin:0;font-family:var(--display,"Bodoni Moda",Georgia,serif);font-weight:400;font-size:2.05rem;line-height:1.08;letter-spacing:-.015em;color:var(--li);text-wrap:balance}'
  + '.gdc-title em{font-style:normal;color:var(--l)}'
  + '.gdc-lead{margin:16px 0 0;font-size:.88rem;line-height:1.65;color:var(--faint);max-width:30ch}'
  + '.gdc-list{list-style:none;margin:28px 0 0;padding:0}'
  + '.gdc-row{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:6px;padding:17px 2px;border-top:1px solid var(--hair);position:relative;'
  +   'text-decoration:none;color:var(--li);transition:color .3s ease}'
  + '.gdc-row::before{content:"";position:absolute;left:0;top:-1px;width:100%;height:1px;background:var(--l);transform:scaleX(0);transform-origin:left;transition:transform .6s ' + EASE + '}'
  + '.gdc-row:hover::before,.gdc-row:focus-visible::before{transform:scaleX(1)}'
  + '.gdc-row:focus-visible{outline:none}'
  + '.gdc-n{font-size:.6rem;font-weight:400;letter-spacing:.14em;color:var(--faint);font-variant-numeric:tabular-nums;transition:color .3s ease}'
  + '.gdc-t{font-size:.97rem;font-weight:300;letter-spacing:.005em;transition:transform .5s ' + EASE + '}'
  + '.gdc-row svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round;opacity:.35;transition:opacity .3s ease,transform .5s ' + EASE + '}'
  + '.gdc-row:hover,.gdc-row:focus-visible{color:var(--l)}'
  + '.gdc-row:hover .gdc-n,.gdc-row:focus-visible .gdc-n{color:var(--l)}'
  + '.gdc-row:hover .gdc-t,.gdc-row:focus-visible .gdc-t{transform:translateX(5px)}'
  + '.gdc-row:hover svg,.gdc-row:focus-visible svg{opacity:1;transform:translateX(4px)}'
  + '.gdc-form{position:relative;display:flex;align-items:center;gap:10px;margin:26px 0 0;border-bottom:1px solid rgba(222,216,203,.22)}'
  + '.gdc-form::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--l);transform:scaleX(0);transform-origin:left;transition:transform .6s ' + EASE + '}'
  + '.gdc-form:focus-within::after{transform:scaleX(1)}'
  + '.gdc-input{flex:1;min-width:0;font:inherit;font-size:.95rem;color:var(--li);background:none;border:none;outline:none;padding:11px 0;cursor:text}'
  + '.gdc-input::placeholder{color:var(--faint);opacity:1}'
  + '.gdc-send{flex:none;width:34px;height:34px;margin-right:-8px;border:none;background:none;color:var(--faint);cursor:pointer;display:grid;place-items:center;transition:color .3s ease,transform .5s ' + EASE + '}'
  + '.gdc-send svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}'
  + '.gdc-form:focus-within .gdc-send,.gdc-send:hover{color:var(--l);transform:translateX(3px)}'
  + '.gdc-send:focus-visible{outline:1px solid var(--l);outline-offset:-4px}'
  + '.gdc-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 18px;margin:26px 0 0;font-size:.62rem;letter-spacing:.16em;text-transform:uppercase}'
  + '.gdc-foot a{color:var(--faint);text-decoration:none;transition:color .3s ease}'
  + '.gdc-foot a:hover,.gdc-foot a:focus-visible{color:var(--l);outline:none}'
  + '.gdc-foot a.is-mail{letter-spacing:.08em;text-transform:none;font-size:.74rem}'
  + '.gdc-done{display:none}'
  + '.gdc-panel.is-done .gdc-ask{display:none}'
  + '.gdc-panel.is-done .gdc-done{display:block}'
  + '.gdc-actions{display:flex;flex-direction:column;align-items:flex-start;gap:16px;margin:30px 0 4px}'
  + '.gdc-cta{display:inline-flex;align-items:center;gap:12px;padding:15px 24px;border-radius:2px;background:var(--l);color:var(--e);text-decoration:none;'
  +   'font-size:.72rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;transition:background-color .3s ease,gap .4s ' + EASE + '}'
  + '.gdc-cta:hover,.gdc-cta:focus-visible{background:#dcb768;gap:16px;outline:none}'
  + '.gdc-cta svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}'
  + '.gdc-back{font:inherit;font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--faint);background:none;border:none;border-bottom:1px solid var(--hair);padding:0 0 4px;cursor:pointer;transition:color .3s ease,border-color .3s ease}'
  + '.gdc-back:hover,.gdc-back:focus-visible{color:var(--l);border-color:var(--l);outline:none}'
  /* entrada escalonada del contenido */
  + '.gdc-panel .gdc-s{opacity:0;transform:translateY(10px)}'
  + '.gdc-panel.is-open .gdc-s{opacity:1;transform:none;transition:opacity .6s ease,transform .8s ' + EASE + ';transition-delay:calc(80ms + var(--i,0) * 55ms)}'

  + '@media (max-width:560px){'
  +   '.gdc-panel{left:8px!important;right:8px!important;top:auto!important;bottom:8px!important;width:auto;max-width:none;max-height:calc(100dvh - 16px);padding:30px 24px 22px}'
  +   '.gdc-title{font-size:1.9rem}'
  +   '.gdc-seal{width:46px;height:46px}.gdc-g{font-size:1.5rem}}'
  + '@media (prefers-reduced-motion:reduce){.gdc-seal::before,.gdc-seal::after,.gdc-badge::after{animation:none!important}.gdc,.gdc-panel,.gdc-panel .gdc-s,.gdc-row *,.gdc-row::before,.gdc-form::after,.gdc-g,.gdc-x,.gdc-close{transition:none!important}'
  +   '.gdc.is-snap{transition:none!important}.gdc-panel .gdc-s{opacity:1;transform:none}}'
  + '@media print{.gdc,.gdc-panel{display:none!important}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- marcado ----------
  function waLink(msg){
    var origen = (document.title || '').split('—')[0].split('·')[0].trim();
    var texto = 'Hola Giandeco. ' + msg + (origen ? '\n\n(Escribo desde la web: ' + origen + ')' : '');
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto);
  }

  var root = document.createElement('div');
  root.className = 'gdc';
  root.innerHTML =
      '<span class="gdc-grip" aria-hidden="true" title="Arrastre para mover"><i></i><i></i><i></i><i></i><i></i><i></i></span>'
    + '<button class="gdc-btn" type="button" aria-label="Abrir atención al cliente, 1 mensaje" aria-expanded="false" aria-controls="gdcPanel">'
    +   '<span class="gdc-seal" aria-hidden="true"><span class="gdc-g">G</span>'
    +     '<svg class="gdc-x" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12"/></svg><span class="gdc-badge">1</span></span>'
    + '</button>';

  var filas = '';
  TEMAS.forEach(function(t, i){
    filas += '<li class="gdc-s" style="--i:' + (i + 3) + '"><a class="gdc-row" href="' + waLink(t.msg) + '" target="_blank" rel="noopener">'
          +  '<span class="gdc-n">0' + (i + 1) + '</span><span class="gdc-t">' + t.t + '</span>' + ARROW + '</a></li>';
  });

  var panel = document.createElement('div');
  panel.className = 'gdc-panel';
  panel.id = 'gdcPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Atención al cliente de Giandeco');
  panel.innerHTML =
      '<button class="gdc-close" type="button" aria-label="Cerrar"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg></button>'
    + '<div class="gdc-ask">'
    +   '<p class="gdc-eyebrow gdc-s" style="--i:0">Atención al cliente</p>'
    +   '<p class="gdc-title gdc-s" style="--i:1">¿En qué podemos <em>ayudarle</em>?</p>'
    +   '<p class="gdc-lead gdc-s" style="--i:2">Le responde una persona del estudio, por WhatsApp.</p>'
    +   '<ul class="gdc-list">' + filas + '</ul>'
    +   '<form class="gdc-form gdc-s" style="--i:7" autocomplete="off">'
    +     '<input class="gdc-input" type="text" maxlength="400" placeholder="O escriba su consulta" aria-label="Escriba su consulta">'
    +     '<button class="gdc-send" type="submit" aria-label="Enviar por WhatsApp">' + ARROW + '</button>'
    +   '</form>'
    +   '<p class="gdc-foot gdc-s" style="--i:8"><a href="https://wa.me/' + WA + '" target="_blank" rel="noopener">WhatsApp ' + WA_VISIBLE + '</a>'
    +     '<a class="is-mail" href="mailto:' + MAIL + '">' + MAIL + '</a></p>'
    + '</div>'
    + '<div class="gdc-done" aria-live="polite">'
    +   '<p class="gdc-eyebrow">Mensaje listo</p>'
    +   '<p class="gdc-title">Le esperamos en <em>WhatsApp</em></p>'
    +   '<p class="gdc-lead">Abrimos la conversación con su mensaje ya escrito. Solo falta enviarlo.</p>'
    +   '<div class="gdc-actions"><a class="gdc-cta" href="#" target="_blank" rel="noopener">Abrir WhatsApp' + ARROW + '</a>'
    +   '<button class="gdc-back" type="button">Hacer otra consulta</button></div>'
    + '</div>';

  document.body.appendChild(panel);
  document.body.appendChild(root);

  var btn = root.querySelector('.gdc-btn');
  var form = panel.querySelector('.gdc-form');
  var input = panel.querySelector('.gdc-input');
  var cta = panel.querySelector('.gdc-cta');
  var isOpen = false;

  function store(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }

  // ---------- posición (anclada al borde más cercano, sobrevive a cambios de tamaño) ----------
  var pos = null;
  try{ pos = JSON.parse(store('gdChatPos') || 'null'); }catch(e){ pos = null; }
  if(!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') pos = { h: 'r', x: 24, v: 'b', y: 24 };

  function place(){
    var w = root.offsetWidth, h = root.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var x = Math.max(M, Math.min(pos.x, vw - w - M)) + 'px';
    var y = Math.max(M, Math.min(pos.y, vh - h - M)) + 'px';
    root.style.left   = pos.h === 'l' ? x : 'auto';
    root.style.right  = pos.h === 'r' ? x : 'auto';
    root.style.top    = pos.v === 't' ? y : 'auto';
    root.style.bottom = pos.v === 'b' ? y : 'auto';
    if(isOpen) placePanel();
  }
  // al soltar, el sello se acomoda solo contra el borde más cercano
  function snap(){
    var r = root.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, E = 24;
    var toLeft = r.left + r.width / 2 < vw / 2;
    var top = Math.max(E, Math.min(r.top, vh - r.height - E));
    root.classList.add('is-snap');
    root.style.left = (toLeft ? E : vw - r.width - E) + 'px';
    root.style.top = top + 'px';
    pos = { h: toLeft ? 'l' : 'r', x: E, v: (top + r.height / 2 > vh / 2) ? 'b' : 't' };
    pos.y = Math.round(pos.v === 'b' ? vh - top - r.height : top);
    store('gdChatPos', JSON.stringify(pos));
    var t0 = Date.now();
    (function follow(){ if(isOpen) placePanel(); if(Date.now() - t0 < 700) requestAnimationFrame(follow); })();
    clearTimeout(snap.t);
    snap.t = setTimeout(function(){ root.classList.remove('is-snap'); place(); }, 720);
  }
  function remember(){
    var r = root.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    pos = {
      h: (r.left + r.width / 2 > vw / 2) ? 'r' : 'l',
      v: (r.top + r.height / 2 > vh / 2) ? 'b' : 't'
    };
    pos.x = Math.round(pos.h === 'r' ? vw - r.right : r.left);
    pos.y = Math.round(pos.v === 'b' ? vh - r.bottom : r.top);
    store('gdChatPos', JSON.stringify(pos));
  }
  function placePanel(){
    if(window.innerWidth <= 560) return;          // en móvil es una hoja inferior (CSS)
    var r = root.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    var pw = panel.offsetWidth, ph = panel.offsetHeight, G = 14;
    var left = (r.left + r.width / 2 > vw / 2) ? r.right - pw : r.left;
    var top;
    if(r.top - ph - G >= M) top = r.top - ph - G;                   // cabe arriba
    else if(r.bottom + G + ph <= vh - M) top = r.bottom + G;        // cabe abajo
    else {                                                          // ni arriba ni abajo: al costado, sin tapar el sello
      top = r.top + r.height / 2 - ph / 2;
      left = (r.right + G + pw <= vw - M) ? r.right + G : r.left - pw - G;
    }
    left = Math.max(M, Math.min(left, vw - pw - M));
    top  = Math.max(M, Math.min(top,  vh - ph - M));
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  // ---------- arrastre ----------
  var drag = null, justDragged = false;
  root.addEventListener('pointerdown', function(e){
    if(e.button !== undefined && e.button !== 0) return;
    var r = root.getBoundingClientRect();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, on: false };
  });
  window.addEventListener('pointermove', function(e){
    if(!drag || e.pointerId !== drag.id) return;
    if(!drag.on){
      if(Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 6) return;
      drag.on = true;
      root.style.right = 'auto'; root.style.bottom = 'auto';
      root.classList.add('is-drag');
      try{ root.setPointerCapture(drag.id); }catch(err){}
    }
    var w = root.offsetWidth, h = root.offsetHeight;
    var left = Math.max(M, Math.min(e.clientX - drag.ox, window.innerWidth - w - M));
    var top  = Math.max(M, Math.min(e.clientY - drag.oy, window.innerHeight - h - M));
    root.style.left = left + 'px';
    root.style.top = top + 'px';
    if(isOpen) placePanel();
  });
  function endDrag(e){
    if(!drag || (e && e.pointerId !== drag.id)) return;
    if(drag.on){
      root.classList.remove('is-drag');
      try{ root.releasePointerCapture(drag.id); }catch(err){}
      snap();
      justDragged = true;
      setTimeout(function(){ justDragged = false; }, 60);
    }
    drag = null;
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', place);

  // ---------- derivación a WhatsApp ----------
  function done(href){
    cta.href = href;
    panel.classList.add('is-done');
    placePanel();
  }
  panel.querySelector('.gdc-list').addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('.gdc-row') : null;
    if(a) setTimeout(function(){ done(a.href); }, 400);   // el enlace abre WhatsApp; la tarjeta confirma
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = input.value.replace(/\s+/g, ' ').trim();
    if(!v){ input.focus(); return; }
    var href = waLink(v);
    window.open(href, '_blank', 'noopener');
    input.value = '';
    done(href);
  });
  panel.querySelector('.gdc-back').addEventListener('click', function(){
    panel.classList.remove('is-done');
    placePanel();
  });

  // ---------- abrir / cerrar ----------
  function open(){
    if(isOpen) return; isOpen = true;
    root.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar atención al cliente');
    placePanel();
    panel.classList.add('is-open');
  }
  function close(refocus){
    if(!isOpen) return; isOpen = false;
    root.classList.remove('is-open');
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir atención al cliente');
    setTimeout(function(){ if(!isOpen) panel.classList.remove('is-done'); }, 500);
    if(refocus) btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function(){ if(justDragged) return; isOpen ? close() : open(); });
  panel.querySelector('.gdc-close').addEventListener('click', function(){ close(true); });
  document.addEventListener('pointerdown', function(e){
    if(isOpen && !panel.contains(e.target) && !root.contains(e.target)) close();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen) close(true); });

  // ---------- entrada ----------
  place();
  // no compite con el hero: el sello entra cuando el visitante ya empezó a bajar
  function visible(){
    var th = window.innerHeight * 0.55;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var show = isOpen || window.scrollY > th || max < th;
    if(show !== root.classList.contains('is-in')){ if(show) place(); root.classList.toggle('is-in', show); }
  }
  window.addEventListener('scroll', visible, { passive: true });
  window.addEventListener('resize', visible);
  setTimeout(visible, 600);
})();
