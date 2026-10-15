/* ==========================================================================
   GIANDECO — ACCESO EN MANTENIMIENTO
   Mientras EN_MANTENIMIENTO sea true, solo ve el sitio quien inició sesión
   en /admin; el resto va a /mantenimiento. Rige en producción y en staging;
   la vista previa en este equipo no se toca.

   Para abrir el sitio al público: EN_MANTENIMIENTO = false y publicar.

   Va en el <head>, antes de todo lo demás, para decidir antes de pintar.
   Es un telón, no una cerradura: el código del sitio es público. Lo que sí
   está protegido de verdad son los datos, en la base de datos.
   ========================================================================== */
(function(){
  // todo el sitio va siempre por https (respaldo por si el servidor no lo fuerza)
  if(location.protocol === 'http:' && /(^|\.)giandeco\.com$/.test(location.hostname)){
    location.replace('https://giandeco.com' + location.pathname + location.search + location.hash); return;
  }
  var EN_MANTENIMIENTO = false;
  var LOCAL = ['127.0.0.1', 'localhost', ''];
  var SESION = 'sb-vsivmdfmecqxeumepyea-auth-token';   // la que deja el acceso de /admin

  if(!EN_MANTENIMIENTO || LOCAL.indexOf(location.hostname) !== -1) return;
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
