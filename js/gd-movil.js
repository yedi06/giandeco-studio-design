/* ==========================================================================
   GIANDECO — PIE DE PÁGINA EN MÓVIL: desplegables accesibles
   Envuelve el contenido de cada columna en un panel y convierte su título en
   un control. Solo actúa por debajo de 860px; en escritorio el pie queda igual.
   Los estilos están en css/gd-movil.css.
   ========================================================================== */
(function(){
  var pie = document.querySelector('.gd-footer');
  if(!pie) return;
  var mq = window.matchMedia('(max-width:859px)');

  // en móvil, los enlaces de ayuda van plegados como un bloque más (en escritorio, la fila de siempre)
  var grid = pie.querySelector('.gd-footer-grid'), ayuda = pie.querySelector('.gd-footer-ayuda');
  if(grid && ayuda){
    var col = document.createElement('div');
    col.className = 'gd-footer-col gd-footer-col-ayuda';
    col.innerHTML = '<h4>Ayuda</h4><ul>' + Array.prototype.map.call(ayuda.querySelectorAll('a:not(.gd-footer-libro)'), function(a){
      return '<li><a href="' + a.getAttribute('href') + '">' + a.textContent + '</a></li>'; }).join('') + '</ul>';
    grid.appendChild(col);
  }

  var cols = Array.prototype.slice.call(pie.querySelectorAll('.gd-footer-col'));
  if(!cols.length) return;

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

  // las redes suben junto al logo en móvil: el pie queda corto y todo plegado
  var marca = pie.querySelector('.gd-footer-brand'), redes = pie.querySelector('.gd-footer-social'), suyo = redes && redes.parentNode;

  function aplicar(){
    if(marca && redes) (mq.matches ? marca : suyo).appendChild(redes);
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
