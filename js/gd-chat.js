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
  + '.gdc,.gdc-panel{--e:#0A0A09;--l:#C9A24A;--li:#DED8CB;--dim:#B9B3A6;--faint:#948D80;--hair:rgba(222,216,203,.11);'
  +   'font-family:var(--body,"Jost",system-ui,sans-serif);font-weight:300;-webkit-font-smoothing:antialiased;box-sizing:border-box}'
  + '.gdc *,.gdc-panel *{box-sizing:border-box}'

  /* ---------- sello lanzador: un solo círculo, sin contornos ---------- */
  + '.gdc{position:fixed;z-index:72;display:flex;align-items:center;gap:2px;margin:0 env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) 0;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;'
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
  +   '.gdc-panel{left:8px!important;right:8px!important;top:auto!important;bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;width:auto;max-width:none;max-height:calc(100dvh - 16px - env(safe-area-inset-bottom,0px));padding:28px 22px calc(20px + env(safe-area-inset-bottom,0px))}.gdc-input{font-size:16px}.gdc-row{padding:18px 2px}.gdc-t{font-size:1rem}.gdc-foot{flex-direction:column;gap:8px}.gdc-close{top:12px;right:12px;width:40px;height:40px}'
  +   '.gdc-title{font-size:1.9rem}'
  +   '.gdc-seal{width:46px;height:46px}.gdc-g{font-size:1.5rem}}'
  + '@media (prefers-reduced-motion:reduce){.gdc-seal::before,.gdc-seal::after,.gdc-badge::after{animation:none!important}.gdc,.gdc-panel,.gdc-panel .gdc-s,.gdc-row *,.gdc-row::before,.gdc-form::after,.gdc-g,.gdc-x,.gdc-close{transition:none!important}'
  +   '.gdc.is-snap{transition:none!important}.gdc-panel .gdc-s{opacity:1;transform:none}}'
  + '@media print{.gdc,.gdc-panel{display:none!important}}';

  /* ---------- lanzador: burbuja en latón con el icono de conversación, contador y asa de arrastre ---------- */
  css += ''
  + '.gdc{gap:6px}'
  /* asa de arrastre: seis puntos discretos a la izquierda de la burbuja, como los lanzadores profesionales */
  + '.gdc-grip{display:grid;width:14px;height:22px;grid-template-columns:repeat(2,4px);gap:3px 4px;opacity:.6}'
  + '.gdc-grip i{width:4px;height:4px;background:#8A8375;box-shadow:none}'
  + ':root[data-tema="claro"] .gdc-grip i{background:#6F6A63}'
  + '.gdc:hover .gdc-grip,.gdc.is-drag .gdc-grip{opacity:1}'
  + '.gdc.is-drag .gdc-grip i{background:#C9A24A}'
  + '.gdc-seal{width:56px;height:56px;border-radius:50%;color:#0A0A09;background:#C9A24A;filter:none;'
  +   'box-shadow:0 10px 26px rgba(0,0,0,.45),0 2px 6px rgba(0,0,0,.3);transition:background-color .3s ease,box-shadow .3s ease,transform .4s ' + EASE + '}'
  + '.gdc-seal::before,.gdc-seal::after{display:none}'
  + '.gdc:hover .gdc-seal{background:#dcb768;box-shadow:0 14px 32px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.3);transform:translateY(-2px)}'
  + '.gdc.is-drag .gdc-seal{background:#dcb768;box-shadow:0 18px 38px rgba(0,0,0,.55);transform:none}'
  + '.gdc.is-open .gdc-seal{background:#DED8CB;box-shadow:0 10px 26px rgba(0,0,0,.45);transform:none}'
  + '.gdc-g{width:28px;height:28px;font-size:0;transform:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
  + '.gdc.is-open .gdc-g{opacity:0;transform:rotate(-90deg) scale(.6)}'
  + '.gdc-x{display:block;width:16px;height:16px;color:#0A0A09;stroke-width:1.8}'
  /* contador: pequeño, fuera del borde y separado de la burbuja por un aro del color de la página */
  + '.gdc-badge{top:-5px;right:-5px;min-width:20px;height:20px;padding:0 5px;background:#0A0A09;color:#F4F1EA;font-family:var(--body,Jost,sans-serif);font-weight:500;font-size:11px;box-shadow:0 0 0 2.5px var(--bg,#0A0A09)}'
  + '.gdc-badge::after{display:none}'
  + '@media (max-width:640px){.gdc-seal{width:54px;height:54px}.gdc-g{width:26px;height:26px}}';

  /* ---------- versión «widget» según el brandbook: ébano con latón (lámina 25), latón solo como acento (lámina 29), iconos de línea con esquinas rectas (lámina 35) ---------- */
  css += ''
  /* burbuja */
  + '.gdc{gap:10px}'
  + '.gdc-grip{width:12px;height:20px;grid-template-columns:repeat(2,3.5px);gap:3.5px 4px;opacity:1}'
  + '.gdc-grip i{width:3.5px;height:3.5px;background:#B9B3A6}'
  + '.gdc-seal{width:60px;height:60px;background:#0A0A09;color:#C9A24A;box-shadow:inset 0 0 0 1.5px #C9A24A,0 8px 22px rgba(0,0,0,.38);transition:background-color .2s ease,box-shadow .2s ease,transform .2s ease}'
  + '.gdc:hover .gdc-seal{background:#171613;box-shadow:inset 0 0 0 1.5px #C9A24A,0 10px 26px rgba(0,0,0,.42);transform:none}'
  + '.gdc.is-open .gdc-seal{background:#0A0A09;box-shadow:inset 0 0 0 1.5px #C9A24A,0 8px 22px rgba(0,0,0,.38)}'
  + '.gdc-g{width:32px;height:32px;stroke-width:1.6;stroke-linecap:square;stroke-linejoin:miter}'
  + '.gdc-x{width:17px;height:17px;color:#C9A24A;stroke-width:1.6;stroke-linecap:square}'
  + '.gdc-badge{top:-3px;right:-3px;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#C9A24A;color:#0A0A09;font-size:11px;font-weight:600;box-shadow:0 0 0 2px var(--bg,#0A0A09)}'
  + '@media (max-width:640px){.gdc-seal{width:56px;height:56px}.gdc-g{width:31px;height:31px}}'
  /* panel */
  + '.gdc-panel{width:380px;height:min(600px,calc(100dvh - 120px));padding:0;display:flex;flex-direction:column;overflow:hidden;background:#F4F1EA;color:#171613;'
  +   'border-radius:14px;box-shadow:0 0 0 1px rgba(222,216,203,.16),0 18px 50px rgba(0,0,0,.34),0 2px 8px rgba(0,0,0,.14);font-weight:400}'
  + '.gdc-head{flex:none;display:flex;align-items:center;gap:12px;padding:14px 12px 14px 18px;background:#0A0A09;color:#F4F1EA}'
  + '.gdc-ava{position:relative;flex:none;width:40px;height:40px;border-radius:50%;background:#171613;display:grid;place-items:center;box-shadow:inset 0 0 0 1px rgba(201,162,74,.45)}'
  + '.gdc-ava img{width:26px;height:auto;display:block}'
  + '.gdc-ava::after{content:"";position:absolute;right:0;bottom:1px;width:10px;height:10px;border-radius:50%;background:#C9A24A;box-shadow:0 0 0 2px #0A0A09}'
  + '.gdc-who{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}'
  + '.gdc-who b{font-weight:600;font-size:.98rem;letter-spacing:.01em}'
  + '.gdc-who small{font-size:.74rem;color:#B9B3A6}'
  + '.gdc-panel .gdc-close{position:static;width:36px;height:36px;color:#DED8CB;border-radius:8px}'
  + '.gdc-panel .gdc-close:hover{color:#C9A24A;background:rgba(255,255,255,.06);transform:none}'
  + '.gdc-panel .gdc-close svg{width:14px;height:14px;stroke-width:1.6}'
  + '.gdc-body{flex:1;overflow-y:auto;padding:20px 16px 12px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}'
  + '.gdc-msg{display:flex;align-items:flex-end;gap:8px;max-width:88%}'
  + '.gdc-msg .gdc-ava{width:28px;height:28px}.gdc-msg .gdc-ava img{width:18px}.gdc-msg .gdc-ava::after{display:none}'
  + '.gdc-bub{margin:0;padding:10px 14px;border-radius:16px 16px 16px 4px;background:#E9E4D8;color:#171613;font-size:.9rem;line-height:1.45}'
  + '.gdc-msg.es-yo{align-self:flex-end;flex-direction:row-reverse}'
  + '.gdc-msg.es-yo .gdc-bub{background:#0A0A09;color:#F4F1EA;border-radius:16px 16px 4px 16px}'
  + '.gdc-chips{display:flex;flex-wrap:wrap;gap:8px;padding-left:36px}'
  + '.gdc-chip{display:inline-flex;align-items:center;padding:8px 13px;border:1.5px solid #171613;border-radius:10px;background:transparent;color:#171613;'
  +   'font:inherit;font-size:.84rem;font-weight:500;line-height:1.2;text-decoration:none;cursor:pointer;transition:background-color .2s ease,color .2s ease,border-color .2s ease}'
  + '.gdc-chip:hover,.gdc-chip:focus-visible{background:#0A0A09;color:#F4F1EA;border-color:#0A0A09;outline:none}'
  + '.gdc-cta2{display:inline-flex;align-items:center;gap:8px;margin:4px 0 0 36px;padding:10px 16px;border-radius:10px;background:#C9A24A;color:#0A0A09;text-decoration:none;font-size:.84rem;font-weight:600;align-self:flex-start}'
  + '.gdc-cta2:hover{background:#D2AD5C}'
  + '.gdc-cta2 svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'
  + '.gdc-compose{flex:none;display:flex;align-items:center;gap:6px;margin:8px 12px 6px;padding:6px 6px 6px 16px;border:1px solid #B9B3A6;border-radius:24px;background:#FAF8F3;transition:border-color .2s ease}'
  + '.gdc-compose:focus-within{border-color:#C9A24A}'
  + '.gdc-compose input{flex:1;min-width:0;border:none;outline:none;background:none;font:inherit;font-size:.9rem;color:#171613;padding:8px 0}'
  + '.gdc-compose input::placeholder{color:#4A4844}'
  + '.gdc-compose button{flex:none;width:36px;height:36px;border:none;border-radius:50%;background:#C9A24A;color:#0A0A09;display:grid;place-items:center;cursor:pointer;transition:background-color .2s ease}'
  + '.gdc-compose button:hover{background:#D2AD5C}'
  + '.gdc-compose svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'
  + '.gdc-pie{flex:none;margin:0 0 10px;text-align:center;font-size:.7rem;color:#4A4844}'
  + '.gdc-pie a{color:#C9A24A;text-decoration:none}'
  /* celular: hoja inferior a todo el ancho, sin salirse de la pantalla */
  + '@media (max-width:560px){'
  +   '.gdc-panel{left:10px!important;right:10px!important;top:auto!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;'
  +     'width:auto!important;max-width:none!important;height:min(76dvh,600px);max-height:calc(100dvh - 20px - env(safe-area-inset-bottom,0px));padding:0!important;border-radius:16px}'
  +   '.gdc-head{padding:12px 10px 12px 14px}.gdc-who small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  +   '.gdc-body{padding:16px 12px 10px}.gdc-chips{padding-left:0}.gdc-msg{max-width:94%}'
  +   '.gdc-compose{margin:8px 10px 6px}.gdc-compose input{font-size:16px}'   /* 16 px: iPhone no hace zoom al escribir */
  +   '.gdc.is-open{opacity:0;pointer-events:none}'                          /* la hoja tapa la burbuja: se cierra con su X */
  +   '.gdc{gap:10px}.gdc-seal{width:54px;height:54px}.gdc-g{width:29px;height:29px}'   /* en celular, casi igual que en escritorio */
  +   '.gdc-badge{top:-3px;right:-3px}'
  + '}';

  + ':root[data-tema="claro"] .gdc-grip i{background:#6F6A63}';
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
    + '<button class="gdc-btn" type="button" aria-label="Abrir chat con Giandeco, 1 mensaje" aria-expanded="false" aria-controls="gdcPanel">'
    +   '<span class="gdc-seal" aria-hidden="true">'
    +     /* icono de conversación: burbuja al frente y otra asomando detrás */
          '<svg class="gdc-g" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 8.5h13v10.5H8l-5.5 4z"/><path d="M7 4.5h14.5V15"/></svg>'
    +     '<svg class="gdc-x" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12"/></svg><span class="gdc-badge">1</span></span>'
    + '</button>';

  var LOGO = '<span class="gdc-ava" aria-hidden="true"><img src="images/firma/logo-giandeco-oficial.png" alt=""></span>';
  var ENVIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  var chips = TEMAS.map(function(t){
    return '<a class="gdc-chip" href="' + waLink(t.msg) + '" target="_blank" rel="noopener" data-txt="' + t.t + '">' + t.t + '</a>';
  }).join('');

  var panel = document.createElement('div');
  panel.className = 'gdc-panel';
  panel.id = 'gdcPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat con Giandeco');
  panel.innerHTML =
      '<div class="gdc-head">' + LOGO.replace('aria-hidden="true"', '') +
        '<div class="gdc-who"><b>Giandeco</b><small>En línea · le responde un asesor</small></div>' +
        '<button class="gdc-close" type="button" aria-label="Cerrar"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg></button>' +
      '</div>' +
      '<div class="gdc-body" aria-live="polite">' +
        '<div class="gdc-msg">' + LOGO + '<p class="gdc-bub">Hola, le saluda el equipo de Giandeco.</p></div>' +
        '<div class="gdc-msg">' + LOGO + '<p class="gdc-bub">¿En qué podemos ayudarle?</p></div>' +
        '<div class="gdc-chips">' + chips + '</div>' +
      '</div>' +
      '<form class="gdc-compose" autocomplete="off">' +
        '<input type="text" maxlength="400" placeholder="Escriba su mensaje…" aria-label="Escriba su mensaje">' +
        '<button type="submit" aria-label="Enviar">' + ENVIAR + '</button>' +
      '</form>' +
      '<p class="gdc-pie">Continuamos la conversación por <a href="https://wa.me/' + WA + '" target="_blank" rel="noopener">WhatsApp</a></p>';

  document.body.appendChild(panel);
  document.body.appendChild(root);

  var btn = root.querySelector('.gdc-btn');
  var form = panel.querySelector('.gdc-compose');
  var input = form.querySelector('input');
  var cuerpo = panel.querySelector('.gdc-body');
  var isOpen = false;

  function store(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }

  // ---------- posición (anclada al borde más cercano, sobrevive a cambios de tamaño) ----------
  var pos = null;
  try{ pos = JSON.parse(store('gdChatPos') || 'null'); }catch(e){ pos = null; }
  if(!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') pos = { h: 'r', x: 24, v: 'b', y: 24 };

  function place(){
    var w = root.offsetWidth, h = root.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var x = Math.max(M, Math.min(pos.x, vw - w - M)) + 'px';
    var y = Math.max(M, Math.min(pos.y, vh - h - M)) + 'px';       // la altura elegida se respeta (en móvil también)
    root.style.left   = pos.h === 'l' ? x : 'auto';
    root.style.right  = pos.h === 'r' ? x : 'auto';
    root.style.top    = pos.v === 't' ? y : 'auto';
    root.style.bottom = pos.v === 'b' ? y : 'auto';
    if(isOpen) placePanel();
  }
  // al soltar, el sello se acomoda solo contra el borde más cercano
  function snap(){
    var r = root.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, E = vw <= 560 ? 16 : 24;   // más cerca de la esquina en móvil
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

  // ---------- conversación: lo que el cliente elige o escribe se continúa en WhatsApp ----------
  function burbuja(txt, yo){
    var d = document.createElement('div');
    d.className = 'gdc-msg' + (yo ? ' es-yo' : '');
    d.innerHTML = (yo ? '' : LOGO) + '<p class="gdc-bub"></p>';
    d.querySelector('.gdc-bub').textContent = txt;
    cuerpo.appendChild(d);
  }
  function responder(texto, href){
    burbuja(texto, true);
    setTimeout(function(){
      burbuja('Perfecto. Un asesor le atiende por WhatsApp: abrimos la conversación con su mensaje ya escrito.', false);
      var a = document.createElement('a');
      a.className = 'gdc-cta2'; a.href = href; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = 'Abrir WhatsApp' + ENVIAR;
      cuerpo.appendChild(a);
      cuerpo.scrollTop = cuerpo.scrollHeight;
    }, 450);
    cuerpo.scrollTop = cuerpo.scrollHeight;
  }
  panel.querySelector('.gdc-chips').addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('.gdc-chip') : null;
    if(a) responder(a.getAttribute('data-txt'), a.href);   // el enlace ya abre WhatsApp
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = input.value.replace(/\s+/g, ' ').trim();
    if(!v){ input.focus(); return; }
    var href = waLink(v);
    window.open(href, '_blank', 'noopener');
    input.value = '';
    responder(v, href);
  });

  // ---------- abrir / cerrar ----------
  function open(){
    if(isOpen) return; isOpen = true;
    root.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Cerrar chat');
    setTimeout(function(){ if(isOpen && window.innerWidth > 560) input.focus({ preventScroll: true }); }, 350);
    placePanel();
    panel.classList.add('is-open');
  }
  function close(refocus){
    if(!isOpen) return; isOpen = false;
    root.classList.remove('is-open');
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir chat con Giandeco');
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
