/* ==========================================================================
   GIANDECO — ATENCIÓN AL CLIENTE
   Lanzador flotante arrastrable + panel de conversación que deriva a WhatsApp.
   Autónomo: inyecta su propio CSS y marcado, así funciona igual en el home
   (que no carga giandeco.css) y en el resto de páginas.
   ========================================================================== */
(function(){
  if(window.gdChat || !document.body) return;
  window.gdChat = true;

  var WA = '51920775559';
  var MAIL = 'contacto@giandeco.com';
  var TEMAS = [
    { chip: 'Diseñar o remodelar mi tienda', msg: 'Quiero diseñar o remodelar mi tienda.' },
    { chip: 'Un proyecto para mi hogar',     msg: 'Tengo un proyecto para mi hogar.' },
    { chip: 'Piezas del catálogo',           msg: 'Quiero consultar por piezas del catálogo.' },
    { chip: 'Un stand o un evento',          msg: 'Necesito un stand o la ambientación de un evento.' }
  ];
  var M = 12; // margen mínimo contra los bordes de la ventana

  var css = ''
  + '.gdc,.gdc-panel{--e:#0A0A09;--l:#C9A24A;--li:#DED8CB;--dim:#B9B3A6;--faint:#8a8375;--ln:#2a2621;'
  +   'font-family:var(--body,"Jost",system-ui,sans-serif);font-weight:300;-webkit-font-smoothing:antialiased;box-sizing:border-box}'
  + '.gdc *,.gdc-panel *{box-sizing:border-box}'
  + '.gdc{position:fixed;z-index:66;display:flex;align-items:center;gap:4px;padding:5px 5px 5px 4px;border-radius:40px;'
  +   'background:rgba(16,15,13,.86);border:1px solid rgba(201,162,74,.34);box-shadow:0 14px 40px rgba(0,0,0,.42);'
  +   '-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);touch-action:none;-webkit-user-select:none;user-select:none;'
  +   'opacity:0;transform:translateY(10px);transition:opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1),box-shadow .3s ease,border-color .3s ease}'
  + '.gdc.is-in{opacity:1;transform:none}'
  + '.gdc:hover,.gdc.is-drag{border-color:rgba(201,162,74,.7)}'
  + '.gdc.is-drag{box-shadow:0 22px 56px rgba(0,0,0,.55);transition:none}'
  + '.gdc-grip{width:20px;height:40px;cursor:grab;opacity:.55;transition:opacity .25s ease;'
  +   'background:radial-gradient(circle,var(--li) 1.3px,transparent 1.6px) center/7px 7px;background-repeat:repeat;'
  +   '-webkit-mask:linear-gradient(#000,#000) center/14px 21px no-repeat;mask:linear-gradient(#000,#000) center/14px 21px no-repeat}'
  + '.gdc:hover .gdc-grip{opacity:1}'
  + '.gdc.is-drag,.gdc.is-drag .gdc-grip,.gdc.is-drag .gdc-btn{cursor:grabbing}'
  + '.gdc-btn{position:relative;width:48px;height:48px;border-radius:50%;border:none;padding:0;margin:0;cursor:pointer;'
  +   'background:var(--l);color:var(--e);display:grid;place-items:center;transition:background-color .25s ease,transform .3s cubic-bezier(.16,1,.3,1)}'
  + '.gdc-btn:hover{background:#dcb768}'
  + '.gdc-btn:focus-visible{outline:2px solid var(--li);outline-offset:3px}'
  + '.gdc-btn svg{width:21px;height:21px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;'
  +   'position:absolute;transition:opacity .25s ease,transform .3s cubic-bezier(.16,1,.3,1)}'
  + '.gdc-btn .gdc-x{opacity:0;transform:rotate(-45deg) scale(.7)}'
  + '.gdc.is-open .gdc-btn .gdc-x{opacity:1;transform:none}'
  + '.gdc.is-open .gdc-btn .gdc-i{opacity:0;transform:rotate(45deg) scale(.7)}'
  + '.gdc-badge{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;'
  +   'background:var(--li);color:var(--e);border:2px solid #100f0d;font-size:10px;font-weight:500;line-height:14px;text-align:center;'
  +   'transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s ease}'
  + '.gdc.is-seen .gdc-badge{transform:scale(0);opacity:0}'

  + '.gdc-panel{position:fixed;z-index:67;width:364px;max-width:calc(100vw - 24px);max-height:min(590px,calc(100vh - 24px));max-height:min(590px,calc(100dvh - 24px));'
  +   'display:flex;flex-direction:column;background:#12110f;color:var(--li);border:1px solid var(--ln);border-radius:4px;overflow:hidden;'
  +   'box-shadow:0 30px 80px rgba(0,0,0,.6);opacity:0;visibility:hidden;transform:translateY(10px) scale(.985);'
  +   'transition:opacity .3s ease,transform .38s cubic-bezier(.16,1,.3,1),visibility 0s linear .38s}'
  + '.gdc-panel.is-open{opacity:1;visibility:visible;transform:none;transition:opacity .3s ease,transform .38s cubic-bezier(.16,1,.3,1)}'
  + '.gdc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 20px 18px;border-bottom:1px solid var(--ln);'
  +   'background:radial-gradient(120% 160% at 0% 0%,rgba(201,162,74,.12),transparent 60%)}'
  + '.gdc-eyebrow{margin:0 0 8px;font-size:.62rem;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--l)}'
  + '.gdc-title{margin:0;font-family:var(--display,"Bodoni Moda",Georgia,serif);font-weight:400;font-size:1.9rem;line-height:1;letter-spacing:-.01em;color:var(--li)}'
  + '.gdc-sub{margin:10px 0 0;font-size:.8rem;line-height:1.5;color:var(--faint)}'
  + '.gdc-close{flex:none;width:30px;height:30px;margin:-4px -6px 0 0;border:none;border-radius:50%;background:none;color:var(--dim);cursor:pointer;display:grid;place-items:center;transition:color .2s ease,background-color .2s ease}'
  + '.gdc-close:hover{color:var(--li);background:rgba(201,162,74,.16)}'
  + '.gdc-close svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round}'
  + '.gdc-body{flex:1;min-height:0;overflow-y:auto;padding:18px 20px 6px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#2a2621 transparent}'
  + '.gdc-msg{max-width:86%;padding:11px 14px;font-size:.9rem;line-height:1.55;border-radius:3px 14px 14px 14px;background:#1c1a16;border:1px solid var(--ln);color:var(--dim);'
  +   'animation:gdcIn .4s cubic-bezier(.16,1,.3,1) both}'
  + '.gdc-msg.is-user{align-self:flex-end;border-radius:14px 3px 14px 14px;background:rgba(201,162,74,.13);border-color:rgba(201,162,74,.36);color:var(--li)}'
  + '@keyframes gdcIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'
  + '.gdc-typing{display:inline-flex;gap:4px;padding:14px 14px}'
  + '.gdc-typing i{width:5px;height:5px;border-radius:50%;background:var(--faint);animation:gdcDot 1s ease-in-out infinite}'
  + '.gdc-typing i:nth-child(2){animation-delay:.15s}.gdc-typing i:nth-child(3){animation-delay:.3s}'
  + '@keyframes gdcDot{0%,60%,100%{opacity:.3;transform:none}30%{opacity:1;transform:translateY(-3px)}}'
  + '.gdc-chips{display:flex;flex-direction:column;align-items:flex-start;gap:7px;margin:4px 0 6px}'
  + '.gdc-chip{font:inherit;font-size:.84rem;font-weight:400;text-align:left;color:var(--li);background:none;border:1px solid rgba(222,216,203,.2);border-radius:20px;'
  +   'padding:8px 14px;cursor:pointer;transition:border-color .2s ease,color .2s ease,background-color .2s ease}'
  + '.gdc-chip:hover,.gdc-chip:focus-visible{border-color:var(--l);color:var(--l);background:rgba(201,162,74,.07);outline:none}'
  + '.gdc-cta{display:flex;align-items:center;justify-content:center;gap:10px;margin:4px 0 8px;padding:14px 18px;border-radius:2px;text-decoration:none;'
  +   'background:var(--l);color:var(--e);font-size:.76rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;transition:background-color .25s ease;animation:gdcIn .4s cubic-bezier(.16,1,.3,1) both}'
  + '.gdc-cta:hover{background:#dcb768}'
  + '.gdc-cta svg{width:17px;height:17px;fill:currentColor;flex:none}'
  + '.gdc-form{display:flex;align-items:center;gap:8px;padding:12px 12px 12px 20px;border-top:1px solid var(--ln)}'
  + '.gdc-input{flex:1;min-width:0;font:inherit;font-size:.92rem;color:var(--li);background:none;border:none;outline:none;padding:8px 0;cursor:text}'
  + '.gdc-input::placeholder{color:var(--faint)}'
  + '.gdc-send{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid rgba(201,162,74,.4);background:none;color:var(--l);cursor:pointer;display:grid;place-items:center;'
  +   'transition:background-color .2s ease,color .2s ease,border-color .2s ease}'
  + '.gdc-send:hover{background:var(--l);color:var(--e);border-color:var(--l)}'
  + '.gdc-send svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'
  + '.gdc-foot{margin:0;padding:0 20px 14px;font-size:.72rem;line-height:1.5;color:var(--faint)}'
  + '.gdc-foot a{color:var(--dim);text-decoration:none;border-bottom:1px solid var(--ln);transition:color .2s ease,border-color .2s ease}'
  + '.gdc-foot a:hover{color:var(--l);border-color:var(--l)}'
  + '@media (max-width:560px){.gdc-panel{left:8px!important;right:8px!important;top:auto!important;bottom:8px!important;width:auto;max-width:none;max-height:calc(100dvh - 16px)}'
  +   '.gdc-btn{width:46px;height:46px}}'
  + '@media (prefers-reduced-motion:reduce){.gdc,.gdc-panel,.gdc-msg,.gdc-cta,.gdc-btn svg{transition:none!important;animation:none!important}.gdc-typing i{animation:none}}'
  + '@media print{.gdc,.gdc-panel{display:none!important}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- marcado ----------
  var root = document.createElement('div');
  root.className = 'gdc';
  root.innerHTML =
      '<span class="gdc-grip" aria-hidden="true" title="Arrastre para mover"></span>'
    + '<button class="gdc-btn" type="button" aria-label="Abrir atención al cliente" aria-expanded="false" aria-controls="gdcPanel">'
    +   '<svg class="gdc-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4.5 19.5l1.4-4.3A7.5 7.5 0 1 1 20 11.5z"/><path d="M9 10.5h6M9 13.5h3.5"/></svg>'
    +   '<svg class="gdc-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    +   '<span class="gdc-badge" aria-hidden="true">1</span>'
    + '</button>';

  var panel = document.createElement('div');
  panel.className = 'gdc-panel';
  panel.id = 'gdcPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Atención al cliente de Giandeco');
  panel.innerHTML =
      '<div class="gdc-head"><div>'
    +   '<p class="gdc-eyebrow">Atención al cliente</p>'
    +   '<p class="gdc-title">Giandeco</p>'
    +   '<p class="gdc-sub">Le atiende una persona del estudio, por WhatsApp.</p>'
    + '</div><button class="gdc-close" type="button" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="gdc-body" aria-live="polite"></div>'
    + '<form class="gdc-form" autocomplete="off">'
    +   '<input class="gdc-input" type="text" maxlength="400" placeholder="Escriba su consulta…" aria-label="Escriba su consulta">'
    +   '<button class="gdc-send" type="submit" aria-label="Enviar"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>'
    + '</form>'
    + '<p class="gdc-foot">También por correo: <a href="mailto:' + MAIL + '">' + MAIL + '</a></p>';

  document.body.appendChild(panel);
  document.body.appendChild(root);

  var btn = root.querySelector('.gdc-btn');
  var body = panel.querySelector('.gdc-body');
  var form = panel.querySelector('.gdc-form');
  var input = panel.querySelector('.gdc-input');
  var isOpen = false, started = false;

  function store(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }

  // ---------- posición (anclada al borde más cercano, sobrevive a cambios de tamaño) ----------
  var pos = null;
  try{ pos = JSON.parse(store('gdChatPos') || 'null'); }catch(e){ pos = null; }
  if(!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') pos = { h: 'r', x: 20, v: 'b', y: 20 };

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
    var pw = panel.offsetWidth, ph = panel.offsetHeight;
    var left = (r.left + r.width / 2 > vw / 2) ? r.right - pw : r.left;
    var top;
    if(r.top - ph - 12 >= M) top = r.top - ph - 12;                 // cabe arriba
    else if(r.bottom + 12 + ph <= vh - M) top = r.bottom + 12;      // cabe abajo
    else {                                                          // ni arriba ni abajo: al costado, sin tapar el lanzador
      top = r.top + r.height / 2 - ph / 2;
      left = (r.right + 12 + pw <= vw - M) ? r.right + 12 : r.left - pw - 12;
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

  // ---------- conversación ----------
  function add(text, user){
    var d = document.createElement('div');
    d.className = 'gdc-msg' + (user ? ' is-user' : '');
    d.textContent = text;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }
  function typing(then){
    var t = document.createElement('div');
    t.className = 'gdc-msg gdc-typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); then(); }, 750);
  }
  function waLink(msg){
    var origen = (document.title || '').split('—')[0].split('·')[0].trim();
    var texto = 'Hola Giandeco. ' + msg + (origen ? '\n\n(Escribo desde la web: ' + origen + ')' : '');
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto);
  }
  function chips(){
    var c = document.createElement('div');
    c.className = 'gdc-chips';
    TEMAS.forEach(function(t){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gdc-chip'; b.textContent = t.chip;
      b.addEventListener('click', function(){ ask(t.chip, t.msg); });
      c.appendChild(b);
    });
    body.appendChild(c);
  }
  function ask(visible, msg){
    var old = body.querySelectorAll('.gdc-chips, .gdc-cta');
    for(var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    add(visible, true);
    typing(function(){
      add('Perfecto. Dejamos su mensaje listo: al continuar se abre WhatsApp y solo tiene que enviarlo.');
      var a = document.createElement('a');
      a.className = 'gdc-cta';
      a.href = waLink(msg);
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.6-1.200.1-.200 0-.300 0-.500l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.300-.9.900-.9 2.200s.900 2.500 1.100 2.700c.1.200 1.900 2.900 4.600 4 1.700.7 2.300.7 3.200.6.500-.1 1.500-.6 1.700-1.200.2-.600.2-1.100.200-1.200-.100-.100-.300-.200-.500-.300z"/></svg>Continuar en WhatsApp';
      body.appendChild(a);
      body.scrollTop = body.scrollHeight;
    });
  }
  function start(){
    if(started) return; started = true;
    add('Bienvenido a Giandeco Studio Design.');
    setTimeout(function(){
      add('Cuéntenos qué necesita, o elija un tema para empezar.');
      chips();
      placePanel();
    }, 450);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = input.value.replace(/\s+/g, ' ').trim();
    if(!v) return;
    input.value = '';
    ask(v, v);
  });

  // ---------- abrir / cerrar ----------
  function open(){
    if(isOpen) return; isOpen = true;
    root.classList.add('is-open', 'is-seen');
    store('gdChatSeen', '1');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar atención al cliente');
    start();
    placePanel();
    panel.classList.add('is-open');
    if(window.matchMedia && window.matchMedia('(hover:hover)').matches) setTimeout(function(){ input.focus({ preventScroll: true }); }, 320);
  }
  function close(refocus){
    if(!isOpen) return; isOpen = false;
    root.classList.remove('is-open');
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir atención al cliente');
    if(refocus) btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function(){ if(justDragged) return; isOpen ? close() : open(); });
  panel.querySelector('.gdc-close').addEventListener('click', function(){ close(true); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen) close(true); });
  document.addEventListener('pointerdown', function(e){
    if(isOpen && !panel.contains(e.target) && !root.contains(e.target)) close();
  });

  // ---------- entrada ----------
  if(store('gdChatSeen') === '1') root.classList.add('is-seen');
  place();
  setTimeout(function(){ place(); root.classList.add('is-in'); }, 900);
})();
