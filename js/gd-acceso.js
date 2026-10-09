/* ==========================================================================
   GIANDECO — ACCESO EN MANTENIMIENTO
   Mientras EN_MANTENIMIENTO sea true, en el dominio de producción solo ve el
   sitio quien inició sesión en /admin; el resto va a /mantenimiento.
   Staging y la vista previa local no se tocan.

   Para abrir el sitio al público: EN_MANTENIMIENTO = false y publicar.

   Va en el <head>, antes de todo lo demás, para decidir antes de pintar.
   Es un telón, no una cerradura: el código del sitio es público. Lo que sí
   está protegido de verdad son los datos, en la base de datos.
   ========================================================================== */
(function(){
  var EN_MANTENIMIENTO = true;
  var PRODUCCION = ['giandeco.com', 'www.giandeco.com'];
  var SESION = 'sb-vsivmdfmecqxeumepyea-auth-token';   // la que deja el acceso de /admin

  if(!EN_MANTENIMIENTO || PRODUCCION.indexOf(location.hostname) === -1) return;
  var pagina = location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/, '');
  if(pagina === 'admin' || pagina === 'mantenimiento') return;

  var esAdmin = false;
  try{
    var s = JSON.parse(localStorage.getItem(SESION) || 'null');
    esAdmin = !!(s && s.user && s.user.email);
  }catch(e){}
  if(esAdmin) return;

  document.documentElement.style.visibility = 'hidden';
  location.replace('mantenimiento');
})();
