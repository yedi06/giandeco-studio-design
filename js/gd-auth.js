/* ==========================================================================
   GIANDECO — CUENTAS (Supabase Auth)
   Correo y clave, Google, recuperación y cambio de clave. Habla con la API
   de autenticación de Supabase directamente (sin librería): /auth/v1.

   Al entrar, la sesión de la tienda (T.sesion) toma el nombre y el correo de
   la cuenta, así el checkout y los pedidos siguen funcionando igual.

   Para que Google funcione, el proveedor debe estar activado en Supabase
   (Authentication → Providers → Google) y esta página debe figurar en
   Authentication → URL Configuration → Redirect URLs.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA;
if(!T || window.GD_AUTH) return;

var API = T.NUBE.url + '/auth/v1', KEY = T.NUBE.key, K = 'gd.auth';

function leer(){ try{ return JSON.parse(localStorage.getItem(K) || 'null'); }catch(e){ return null; } }
function guardar(s){ try{ if(s) localStorage.setItem(K, JSON.stringify(s)); else localStorage.removeItem(K); }catch(e){} }
/* a dónde vuelve el cliente desde Google o desde un correo: esta misma página */
function volver(){ return location.origin + location.pathname.replace(/\.html$/, ''); }

var MSG = {
  credenciales: 'Correo o clave incorrectos.',
  sinConfirmar: 'Confirme su correo: le enviamos un enlace al registrarse.',
  existe: 'Ese correo ya tiene una cuenta. Inicie sesión.',
  debil: 'Use al menos 8 caracteres, con letras y números.',
  espera: 'Demasiados intentos. Espere un minuto e inténtelo de nuevo.',
  google: 'El acceso con Google aún no está activado. Use su correo por ahora.',
  vencido: 'El enlace venció o ya se usó. Pida uno nuevo.',
  igual: 'La nueva clave debe ser distinta de la anterior.',
  red: 'No pudimos conectar. Revise su conexión e inténtelo de nuevo.',
  otro: 'No se pudo completar. Inténtelo de nuevo en un momento.'
};
function mensaje(d, st){
  var c = String(d && (d.error_code || d.code || d.error) || ''), m = String(d && (d.msg || d.message || d.error_description) || '');
  if(c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return MSG.credenciales;
  if(c === 'email_not_confirmed' || /not confirmed/i.test(m)) return MSG.sinConfirmar;
  if(/user_already_exists|email_exists/.test(c) || /already (been )?registered/i.test(m)) return MSG.existe;
  if(c === 'weak_password' || /password should/i.test(m)) return MSG.debil;
  if(c === 'same_password') return MSG.igual;
  if(/provider_disabled/.test(c) || /provider is not enabled|unsupported provider/i.test(m)) return MSG.google;
  if(/otp_expired|bad_jwt|session_not_found/.test(c)) return MSG.vencido;
  if(st === 429 || /rate_limit/.test(c)) return MSG.espera;
  return MSG.otro;
}
function pedir(ruta, o){
  o = o || {};
  var h = { apikey:KEY, 'Content-Type':'application/json' };
  if(o.token) h.Authorization = 'Bearer ' + o.token;
  return fetch(API + ruta, { method:o.method || (o.body ? 'POST' : 'GET'), headers:h, body:o.body ? JSON.stringify(o.body) : undefined })
    .then(function(r){
      return r.text().then(function(t){
        var d = null; try{ d = t ? JSON.parse(t) : null; }catch(e){}
        return r.ok ? { ok:true, data:d } : { ok:false, error:mensaje(d, r.status), status:r.status };
      });
    })
    .catch(function(){ return { ok:false, error:MSG.red }; });
}
function desdeToken(d){
  return { access_token:d.access_token, refresh_token:d.refresh_token,
           expires_at:+d.expires_at || Math.floor(Date.now() / 1000) + (+d.expires_in || 3600), user:d.user || null };
}
/* la sesión de la tienda toma los datos de la cuenta (sin perder el celular que ya tenía) */
function alEntrar(s){
  guardar(s);
  var u = s.user || {}, md = u.user_metadata || {}, prev = T.sesion.get() || {};
  T.sesion.set({
    nombre: md.nombre || md.full_name || md.name || prev.nombre || String(u.email || '').split('@')[0],
    cel: md.cel || prev.cel || '', email: u.email || prev.email || '',
    uid: u.id || '', proveedor: (u.app_metadata && u.app_metadata.provider) || 'email',
    foto: md.avatar_url || md.picture || ''
  });
  return s;
}
function refrescar(s){
  return pedir('/token?grant_type=refresh_token', { body:{ refresh_token:s.refresh_token } }).then(function(r){
    if(r.ok) return alEntrar(desdeToken(r.data));
    guardar(null); return null;
  });
}
/* vuelve de Google, de confirmar el correo o de un enlace de clave: los datos llegan tras el # */
function delEnlace(){
  var h = location.hash.slice(1);
  if(!/(^|&)(access_token|error|error_code)=/.test(h)) return Promise.resolve(null);
  var q = new URLSearchParams(h);
  history.replaceState(null, '', location.pathname + location.search);
  if(q.get('error') || q.get('error_code')){
    var c = q.get('error_code') || q.get('error');
    return Promise.resolve({ error: c === 'access_denied' ? 'Se canceló el acceso.' : /otp_expired/.test(c) ? MSG.vencido : mensaje({ error_code:c, msg:q.get('error_description') }) });
  }
  var s = desdeToken({ access_token:q.get('access_token'), refresh_token:q.get('refresh_token'), expires_at:q.get('expires_at'), expires_in:q.get('expires_in') });
  return pedir('/user', { token:s.access_token }).then(function(r){
    if(!r.ok) return { error:r.error };
    s.user = r.data; alEntrar(s);
    return { tipo:q.get('type') || 'login' };
  });
}

window.GD_AUTH = {
  actual: leer,
  /* al cargar: procesa el enlace de vuelta o renueva la sesión guardada.
     Devuelve null (sin cuenta), { tipo } o { error } */
  iniciar: function(){
    return delEnlace().then(function(e){
      if(e) return e;
      var s = leer(); if(!s) return null;
      if(s.expires_at - 60 > Date.now() / 1000) return { tipo:'activa' };
      return refrescar(s).then(function(n){ return n ? { tipo:'activa' } : null; });
    });
  },
  entrar: function(email, clave){
    return pedir('/token?grant_type=password', { body:{ email:email, password:clave } }).then(function(r){
      if(r.ok) alEntrar(desdeToken(r.data)); return r;
    });
  },
  /* con confirmación por correo activa, Supabase no devuelve sesión: r.confirmar = true */
  registrar: function(nombre, email, clave){
    return pedir('/signup?redirect_to=' + encodeURIComponent(volver()), { body:{ email:email, password:clave, data:{ nombre:nombre, full_name:nombre } } }).then(function(r){
      if(!r.ok) return r;
      if(r.data && r.data.access_token){ alEntrar(desdeToken(r.data)); return r; }
      var u = (r.data && r.data.user) || r.data || {};
      // un correo ya registrado vuelve sin identidades (Supabase no lo dice para no exponerlo)
      if(u.identities && u.identities.length === 0) return { ok:false, error:MSG.existe };
      r.confirmar = true; return r;
    });
  },
  /* antes de salir hacia Google se confirma que el proveedor está activo:
     si no, Supabase mostraría su propia página de error */
  google: function(){
    return pedir('/settings').then(function(r){
      if(r.ok && r.data && r.data.external && r.data.external.google === false) return { ok:false, error:MSG.google };
      if(!r.ok && r.error === MSG.red) return r;
      location.href = API + '/authorize?provider=google&redirect_to=' + encodeURIComponent(volver());
      return { ok:true };
    });
  },
  recuperar: function(email){ return pedir('/recover?redirect_to=' + encodeURIComponent(volver()), { body:{ email:email } }); },
  nuevaClave: function(clave){
    var s = leer(); if(!s) return Promise.resolve({ ok:false, error:MSG.vencido });
    return pedir('/user', { method:'PUT', token:s.access_token, body:{ password:clave } });
  },
  actualizar: function(datos){
    var s = leer(); if(!s) return Promise.resolve({ ok:false });
    return pedir('/user', { method:'PUT', token:s.access_token, body:{ data:datos } }).then(function(r){
      if(r.ok){ s.user = r.data; guardar(s); } return r;
    });
  },
  salir: function(){
    var s = leer(); guardar(null); T.sesion.salir();
    return s ? pedir('/logout', { token:s.access_token, body:{} }) : Promise.resolve();
  }
};
})();
