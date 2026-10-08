/* ==========================================================================
   GIANDECO — TEMA CLARO / OSCURO
   Se carga en el <head>, sin defer: fija el tema antes de pintar para que no
   haya parpadeo. Recuerda la elección (localStorage) y gobierna todos los
   botones de tema del sitio, incluido el del menú móvil que crea aquí.
   Los colores están en css/gd-tema.css.
   ========================================================================== */
(function(){
  var K = 'gdTema', raiz = document.documentElement;
  var COLOR = { oscuro: '#0A0A09', claro: '#F4F1EA' };

  function guardado(){ try{ return localStorage.getItem(K); }catch(e){ return null; } }
  function actual(){ return raiz.getAttribute('data-tema') === 'claro' ? 'claro' : 'oscuro'; }

  function rotular(){
    var otro = actual() === 'claro' ? 'oscuro' : 'claro', msg = 'Cambiar a tema ' + otro;
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', COLOR[actual()]);
    var bs = document.querySelectorAll('.sh-tema, [data-gd-tema]');
    for(var i = 0; i < bs.length; i++){
      bs[i].setAttribute('aria-label', msg);
      bs[i].setAttribute('title', msg);
      var t = bs[i].querySelector('[data-gd-tema-txt]');
      if(t) t.textContent = 'Tema ' + otro;
    }
  }
  function aplicar(t, animar){
    if(animar){
      raiz.classList.add('gd-tema-anim');
      clearTimeout(aplicar.t);
      aplicar.t = setTimeout(function(){ raiz.classList.remove('gd-tema-anim'); }, 520);
    }
    raiz.setAttribute('data-tema', t);
    rotular();
  }

  // 1) antes de pintar
  raiz.setAttribute('data-tema', guardado() === 'claro' ? 'claro' : 'oscuro');

  // 2) un solo manejador para todos los botones. En captura y cortando la propagación:
  //    el home trae su propio manejador en el botón y, sin esto, el tema cambiaría dos veces.
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.sh-tema, [data-gd-tema]') : null;
    if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var t = actual() === 'claro' ? 'oscuro' : 'claro';
    try{ localStorage.setItem(K, t); }catch(err){}
    aplicar(t, true);
  }, true);

  // 3) en móvil el botón de la barra no se muestra: el tema entra al menú
  var SOL = '<svg class="ico-sol" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>';
  var LUNA = '<svg class="ico-luna" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';
  function montar(){
    var navs = document.querySelectorAll('.sh-mobile-paginas');
    for(var i = 0; i < navs.length; i++){
      if(navs[i].parentNode.querySelector('.gd-tema-fila')) continue;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gd-tema-fila'; b.setAttribute('data-gd-tema', '');
      b.innerHTML = '<span data-gd-tema-txt></span><span class="gd-tema-ico">' + SOL + LUNA + '</span>';
      navs[i].parentNode.insertBefore(b, navs[i].nextSibling);
    }
    rotular();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();

  // otra pestaña cambió el tema: se sigue
  window.addEventListener('storage', function(e){
    if(e.key === K) aplicar(e.newValue === 'claro' ? 'claro' : 'oscuro', false);
  });
})();
