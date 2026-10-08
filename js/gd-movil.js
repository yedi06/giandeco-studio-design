/* ==========================================================================
   GIANDECO — PIE DE PÁGINA EN MÓVIL: desplegables accesibles
   Envuelve el contenido de cada columna en un panel y convierte su título en
   un control. Solo actúa por debajo de 860px; en escritorio el pie queda igual.
   Los estilos están en css/gd-movil.css.
   ========================================================================== */
(function(){
  var pie = document.querySelector('.gd-footer');
  if(!pie) return;
  var cols = Array.prototype.slice.call(pie.querySelectorAll('.gd-footer-col'));
  if(!cols.length) return;
  var mq = window.matchMedia('(max-width:859px)');

  cols.forEach(function(col, i){
    var h = col.querySelector('h4');
    if(!h) return;
    var panel = document.createElement('div'), inner = document.createElement('div');
    panel.className = 'gd-footer-panel';
    panel.id = 'gdPie' + i;
    while(h.nextSibling) inner.appendChild(h.nextSibling);
    panel.appendChild(inner);
    col.appendChild(panel);
    col._h = h; col._panel = panel;

    function alternar(){
      if(!mq.matches) return;
      var abrir = !col.classList.contains('is-open');
      col.classList.toggle('is-open', abrir);
      h.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    }
    h.addEventListener('click', alternar);
    h.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); alternar(); }
    });
  });

  // el último bloque (Contacto) empieza abierto: es lo que más se busca en el pie
  cols[cols.length - 1].classList.add('is-open');

  function aplicar(){
    cols.forEach(function(col){
      if(!col._h) return;
      if(mq.matches){
        col._h.setAttribute('role', 'button');
        col._h.setAttribute('tabindex', '0');
        col._h.setAttribute('aria-controls', col._panel.id);
        col._h.setAttribute('aria-expanded', col.classList.contains('is-open') ? 'true' : 'false');
      } else {
        ['role', 'tabindex', 'aria-controls', 'aria-expanded'].forEach(function(a){ col._h.removeAttribute(a); });
      }
    });
  }
  pie.classList.add('gd-acc');
  aplicar();
  if(mq.addEventListener) mq.addEventListener('change', aplicar); else if(mq.addListener) mq.addListener(aplicar);
})();
