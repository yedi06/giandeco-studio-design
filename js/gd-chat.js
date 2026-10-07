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
  + '.gdc,.gdc-panel,.gdc-scrim{--e:#0A0A09;--l:#C9A24A;--li:#DED8CB;--dim:#B9B3A6;--faint:#8a8375;--hair:rgba(222,216,203,.11);'
  +   'font-family:var(--body,"Jost",system-ui,sans-serif);font-weight:300;-webkit-font-smoothing:antialiased;box-sizing:border-box}'
  + '.gdc *,.gdc-panel *{box-sizing:border-box}'

  /* ---------- sello lanzador ---------- */
  + '.gdc{position:fixed;z-index:72;display:flex;align-items:center;height:54px;padding:0 5px 0 0;border-radius:27px;'
  +   'background:rgba(12,11,10,.9);border:1px solid rgba(201,162,74,.26);box-shadow:0 18px 44px rgba(0,0,0,.4);'
  +   '-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);touch-action:none;-webkit-user-select:none;user-select:none;'
  +   'opacity:0;transform:translateY(12px);transition:opacity .8s ease,transform .8s ' + EASE + ',border-color .35s ease,box-shadow .35s ease}'
  + '.gdc.is-in{opacity:1;transform:none}'
  + '.gdc:hover,.gdc.is-open,.gdc.is-drag{border-color:rgba(201,162,74,.6)}'
  + '.gdc.is-drag{box-shadow:0 26px 60px rgba(0,0,0,.55);transition:none}'
  + '.gdc-grip{flex:none;width:26px;height:100%;cursor:grab;opacity:.32;transition:opacity .3s ease;'
  +   'background:radial-gradient(circle,var(--li) .9px,transparent 1.25px) center/5px 5px;background-repeat:repeat;'
  +   '-webkit-mask:linear-gradient(#000,#000) center/10px 15px no-repeat;mask:linear-gradient(#000,#000) center/10px 15px no-repeat}'
  + '.gdc:hover .gdc-grip,.gdc.is-drag .gdc-grip{opacity:.8}'
  + '.gdc.is-drag,.gdc.is-drag .gdc-grip,.gdc.is-drag .gdc-btn{cursor:grabbing}'
  + '.gdc-btn{display:flex;align-items:center;gap:14px;height:100%;padding:0;margin:0;border:none;background:none;cursor:pointer;color:var(--li);font:inherit}'
  + '.gdc-btn:focus-visible{outline:none}'
  + '.gdc-btn:focus-visible .gdc-seal{box-shadow:0 0 0 3px rgba(201,162,74,.35)}'
  + '.gdc-label{font-size:.62rem;font-weight:400;letter-spacing:.24em;text-transform:uppercase;color:var(--dim);padding-left:2px;transition:color .3s ease}'
  + '.gdc:hover .gdc-label,.gdc.is-open .gdc-label{color:var(--li)}'
  + '.gdc-seal{position:relative;flex:none;width:42px;height:42px;border-radius:50%;border:1px solid rgba(201,162,74,.6);display:grid;place-items:center;'
  +   'color:var(--l);transition:background-color .4s ease,color .4s ease,border-color .4s ease,box-shadow .3s ease}'
  + '.gdc:hover .gdc-seal,.gdc.is-open .gdc-seal{background:var(--l);border-color:var(--l);color:var(--e)}'
  + '.gdc-g,.gdc-x{position:absolute;transition:opacity .3s ease,transform .45s ' + EASE + '}'
  + '.gdc-g{font-family:var(--display,"Bodoni Moda",Georgia,serif);font-weight:400;font-size:1.42rem;line-height:1;transform:translateY(-1px)}'
  + '.gdc-x{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.2;stroke-linecap:round;opacity:0;transform:rotate(-90deg) scale(.6)}'
  + '.gdc.is-open .gdc-g{opacity:0;transform:translateY(-1px) rotate(90deg) scale(.6)}'
  + '.gdc.is-open .gdc-x{opacity:1;transform:none}'
  + '.gdc-dot{position:absolute;top:1px;right:1px;width:8px;height:8px;border-radius:50%;background:var(--li);box-shadow:0 0 0 2px #0c0b0a;'
  +   'transition:transform .4s ' + EASE + ',opacity .3s ease}'
  + '.gdc-dot::after{content:"";position:absolute;inset:0;border-radius:50%;border:1px solid var(--li);animation:gdcPing 2.8s ' + EASE + ' 1.4s 3}'
  + '@keyframes gdcPing{0%{transform:scale(1);opacity:.8}70%,100%{transform:scale(2.6);opacity:0}}'
  + '.gdc.is-seen .gdc-dot{transform:scale(0);opacity:0}'

  /* ---------- velo ---------- */
  + '.gdc-scrim{position:fixed;inset:0;z-index:71;background:rgba(6,6,5,.46);opacity:0;visibility:hidden;transition:opacity .5s ease,visibility 0s linear .5s}'
  + '.gdc-scrim.is-open{opacity:1;visibility:visible;transition:opacity .5s ease}'

  /* ---------- tarjeta ---------- */
  + '.gdc-panel{position:fixed;z-index:73;width:392px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);overflow-y:auto;'
  +   'background:#0d0c0b;color:var(--li);border:1px solid rgba(201,162,74,.2);border-radius:2px;box-shadow:0 40px 100px rgba(0,0,0,.65);'
  +   'padding:34px 34px 26px;scrollbar-width:none;opacity:0;visibility:hidden;transform:translateY(14px);'
  +   'transition:opacity .35s ease,transform .5s ' + EASE + ',visibility 0s linear .5s}'
  + '.gdc-panel::-webkit-scrollbar{display:none}'
  + '.gdc-panel::before{content:"";position:absolute;top:-1px;left:34px;width:44px;height:1px;background:var(--l)}'
  + '.gdc-panel.is-open{opacity:1;visibility:visible;transform:none;transition:opacity .35s ease,transform .5s ' + EASE + '}'
  + '.gdc-close{position:absolute;top:18px;right:18px;width:32px;height:32px;border:none;border-radius:50%;background:none;color:var(--faint);cursor:pointer;display:grid;place-items:center;transition:color .25s ease,transform .45s ' + EASE + '}'
  + '.gdc-close:hover{color:var(--l);transform:rotate(90deg)}'
  + '.gdc-close:focus-visible{outline:1px solid var(--l);outline-offset:2px}'
  + '.gdc-close svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.2;stroke-linecap:round}'
  + '.gdc-eyebrow{margin:0 0 18px;font-size:.6rem;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:var(--l)}'
  + '.gdc-title{margin:0;font-family:var(--display,"Bodoni Moda",Georgia,serif);font-weight:400;font-size:2.05rem;line-height:1.08;letter-spacing:-.015em;color:var(--li);text-wrap:balance}'
  + '.gdc-title em{font-style:normal;color:var(--l)}'
  + '.gdc-lead{margin:16px 0 0;font-size:.88rem;line-height:1.65;color:var(--faint);max-width:30ch}'
  + '.gdc-list{list-style:none;margin:28px 0 0;padding:0;border-bottom:1px solid var(--hair)}'
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
  +   '.gdc-panel::before{left:24px}.gdc-title{font-size:1.9rem}'
  +   '.gdc{height:50px}.gdc-seal{width:38px;height:38px}.gdc-g{font-size:1.28rem}.gdc-label{letter-spacing:.2em}}'
  + '@media (prefers-reduced-motion:reduce){.gdc,.gdc-panel,.gdc-scrim,.gdc-panel .gdc-s,.gdc-row *,.gdc-row::before,.gdc-form::after,.gdc-g,.gdc-x,.gdc-close{transition:none!important}'
  +   '.gdc-dot::after{animation:none}.gdc-panel .gdc-s{opacity:1;transform:none}}'
  + '@media print{.gdc,.gdc-panel,.gdc-scrim{display:none!important}}';

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
      '<span class="gdc-grip" aria-hidden="true" title="Arrastre para mover"></span>'
    + '<button class="gdc-btn" type="button" aria-label="Abrir atención al cliente" aria-expanded="false" aria-controls="gdcPanel">'
    +   '<span class="gdc-label" aria-hidden="true">Atención</span>'
    +   '<span class="gdc-seal" aria-hidden="true"><span class="gdc-g">G</span>'
    +     '<svg class="gdc-x" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12"/></svg><span class="gdc-dot"></span></span>'
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

  var scrim = document.createElement('div');
  scrim.className = 'gdc-scrim';

  document.body.appendChild(scrim);
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
  if(!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') pos = { h: 'r', x: 22, v: 'b', y: 22 };

  function place(){
    var w = root.offsetWidth, h = root.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var left = pos.h === 'r' ? vw - w - pos.x : pos.x;
    var top  = pos.v === 'b' ? vh - h - pos.y : pos.y;
    left = Math.max(M, Math.min(left, vw - w - M));
    top  = Math.max(M, Math.min(top,  vh - h - M));
    root.style.left = left + 'px';
    root.style.top = top + 'px';
    if(isOpen) placePanel();
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
      remember();
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
    root.classList.add('is-open', 'is-seen');
    store('gdChatSeen', '1');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar atención al cliente');
    placePanel();
    panel.classList.add('is-open');
    scrim.classList.add('is-open');
  }
  function close(refocus){
    if(!isOpen) return; isOpen = false;
    root.classList.remove('is-open');
    panel.classList.remove('is-open');
    scrim.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir atención al cliente');
    setTimeout(function(){ if(!isOpen) panel.classList.remove('is-done'); }, 500);
    if(refocus) btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function(){ if(justDragged) return; isOpen ? close() : open(); });
  panel.querySelector('.gdc-close').addEventListener('click', function(){ close(true); });
  scrim.addEventListener('click', function(){ close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen) close(true); });

  // ---------- entrada ----------
  if(store('gdChatSeen') === '1') root.classList.add('is-seen');
  place();
  setTimeout(function(){ place(); root.classList.add('is-in'); }, 900);
})();
