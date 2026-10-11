/* ==========================================================================
   GIANDECO — PAGO EN LÍNEA
   Habla con la función backend/functions/pago y abre el formulario de la
   pasarela (Culqi). Los datos de tarjeta se escriben en el formulario de
   Culqi y viajan directo a Culqi: esta web solo recibe un identificador de
   un solo uso y se lo pasa al servidor, que es quien cobra.

   El monto no se decide aquí: lo calcula el servidor.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA;
if(!T || window.GD_PAGO) return;

var FN = T.NUBE.url + '/functions/v1/pago';
function llamar(cuerpo){
  return fetch(FN, { method:'POST', headers:{ 'Content-Type':'application/json', apikey:T.NUBE.key }, body:JSON.stringify(cuerpo) })
    .then(function(r){ return r.json(); }).catch(function(){ return null; });
}
var cargados = {}, actual = null;
function cargar(src){
  return cargados[src] || (cargados[src] = new Promise(function(ok, mal){
    var s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = ok; s.onerror = function(){ delete cargados[src]; mal(new Error(src)); };
    document.head.appendChild(s);
  }));
}

/* ¿hay pasarela? Se recuerda en el dispositivo para pintar sin esperar. */
function estado(){
  return llamar({ accion:'estado' }).then(function(r){
    var a = !!(r && r.activa); T.db('pasarela', a); return a;
  });
}
function consulta(n, cel){ return llamar({ accion:'consulta', n:n, cel:cel }); }

/* Abre el formulario y cobra.
   o = { n, cel, cuenta (respuesta de consulta), contenedor? ('#id' donde incrustarlo), alProcesar(), alTerminar(resultado) }
   resultado = { ok:true, … }  |  { ok:false, mensaje | motivo }  |  { cerrado:true } */
function pagar(o){
  var c = o.cuenta, fin = false;
  function terminar(r){ if(fin) return; fin = true; o.alTerminar(r || { ok:false, motivo:'error' }); }

  Promise.all([cargar('https://js.culqi.com/checkout-js'), cargar('https://3ds.culqi.com').catch(function(){})]).then(function(){
    var device = null, token = null, cuotas = 0;
    var tresDS = window.Culqi3DS || null;

    function cobrar(auth){
      o.alProcesar();
      llamar({ accion:'cobrar', n:o.n, cel:o.cel, token:token, device:device, cuotas:cuotas, auth3ds:auth || null }).then(function(r){
        if(r && r.requiere3ds && !auth && tresDS){ autenticar(r); return; }
        if(r && r.requiere3ds) r = { ok:false, mensaje:'Su banco pidió una verificación adicional que no se pudo completar. Pruebe con otra tarjeta o con otro medio de pago.' };
        terminar(r);
      });
    }
    /* verificación del banco (3-D Secure): la muestra Culqi en su propia ventana */
    function autenticar(r){
      function oir(ev){
        if(ev.origin !== location.origin || !ev.data || typeof ev.data !== 'object') return;
        if(ev.data.parameters3DS){ window.removeEventListener('message', oir); try{ tresDS.reset(); }catch(e){} cobrar(ev.data.parameters3DS); }
        else if(ev.data.error){ window.removeEventListener('message', oir); try{ tresDS.reset(); }catch(e){} terminar({ ok:false, mensaje:'Su banco no pudo verificar la operación. Inténtelo de nuevo o use otro medio de pago.' }); }
      }
      window.addEventListener('message', oir, false);
      try{
        tresDS.settings = { charge:{ totalAmount:r.monto, returnUrl:location.href }, card:{ email:r.email } };
        tresDS.options = { showModal:true, showLoading:true, showIcon:true, closeModalAction:function(){ terminar({ cerrado:true }); },
                           style:{ btnColor:'#C9A24A', btnTextColor:'#0A0A09' } };
        tresDS.initAuthentication(token);
      }catch(e){ window.removeEventListener('message', oir); terminar({ ok:false, mensaje:'No se pudo iniciar la verificación de su banco. Inténtelo de nuevo.' }); }
    }

    var medios = { tarjeta:true, yape:!!c.yape };
    /* El formulario vive dentro de la página (o.contenedor) y se viste con el tema en uso.
       Sigue siendo un marco de Culqi: lo que se escribe ahí no pasa por esta web.
       Colores del brandbook: sobre claro el acento es bronce y el texto ébano. */
    var claro = document.documentElement.getAttribute('data-tema') === 'claro';
    var K = claro
      ? { fondo:'#F4F1EA', campo:'#FBF9F4', raya:'#CFC8B9', acento:'#8A6F3C', texto:'#171613', apoyo:'#4A4844', guia:'#7A746A',
          off:'#DED8CB', offTxt:'#6F6A63', suave:'rgba(138,111,60,.10)', mal:'rgba(160,62,42,.08)', malRaya:'#A85A45', malIco:'#A85A45', logo:'dark' }
      : { fondo:'#0D0D0B', campo:'#171613', raya:'#35302A', acento:'#C9A24A', texto:'#DED8CB', apoyo:'#B9B3A6', guia:'#8A8375',
          off:'#2A2621', offTxt:'#9A9385', suave:'rgba(201,162,74,.10)', mal:'rgba(176,90,70,.16)', malRaya:'#B05A46', malIco:'#D9917F', logo:'light' };
    var FUENTE = 'Jost, "Helvetica Neue", Helvetica, Arial, sans-serif';
    var reglas = {
      'html, body, #app':{ background:K.fondo }, '::-webkit-scrollbar':{ display:'none' }, 'html':{ scrollbarWidth:'none' },
      'body':{ color:K.apoyo }, 'body, body *':{ fontFamily:FUENTE },
      '.mx-6':{ marginLeft:'0', marginRight:'0' }, '.rounded-xl':{ borderRadius:'0' }, '.bg-culqi-white':{ background:K.fondo },
      '.Culqi-Main-Container':{ background:K.fondo }, '.Culqi-Main-Method':{ background:K.fondo },
      '.Culqi-Label':{ color:K.apoyo, fontWeight:'400', fontSize:'11px', letterSpacing:'.14em', textTransform:'uppercase' },
      '.Culqi-Text, .Culqi-Main-Container ~ * span, .Culqi-Main-Method ~ * span':{ color:K.apoyo, opacity:'1' },
      '.Culqi-Input':{ background:K.campo, border:'1px solid ' + K.raya, color:K.texto, borderRadius:'2px', fontSize:'15px' },
      '.Culqi-Input:focus, .Culqi-Input:focus-within':{ border:'1px solid ' + K.acento },
      '.Culqi-Input::placeholder, .Culqi-Input input::placeholder, input::placeholder':{ color:K.guia, opacity:'1' },
      '.Culqi-Input .Culqi-Icon, .Culqi-Input svg':{ color:K.guia },
      '.Culqi-Input-Select':{ background:K.campo, border:'1px solid ' + K.raya, color:K.texto, borderRadius:'2px' },
      '.Culqi-Input-Select-Options':{ background:K.campo, color:K.texto }, '.Culqi-Input-Select-Options-Hover':{ background:K.acento, color:claro ? '#F4F1EA' : '#0A0A09' },
      '.Culqi-Input-Select-Selected':{ color:K.texto },
      '.Culqi-Button':{ background:'#C9A24A', color:'#0A0A09', borderColor:'#C9A24A', borderRadius:'2px', letterSpacing:'.16em', textTransform:'uppercase', fontWeight:'500', fontSize:'12px', opacity:'1' },
      '.Culqi-Button:disabled, .Culqi-Button[disabled]':{ background:K.off, color:K.offTxt, borderColor:K.off, opacity:'1' },
      '.Culqi-Menu':{ color:K.apoyo }, '.Culqi-Menu-Item':{ background:'transparent', color:K.apoyo, border:'1px solid ' + K.raya, borderRadius:'2px' },
      '.Culqi-Menu-Item .Culqi-Icon':{ color:K.apoyo },
      '.Culqi-Menu-Item.active':{ background:K.suave, color:K.acento, border:'1px solid ' + K.acento }, '.Culqi-Menu-Item.active .Culqi-Icon':{ color:K.acento },
      '.Culqi-Menu-Item-Text':{ fontSize:'12px', letterSpacing:'.04em' },
      '.Culqi-message':{ borderRadius:'2px' },
      '.Culqi-message-error':{ background:K.mal, color:K.texto, border:'1px solid ' + K.malRaya }, '.Culqi-message-error .Culqi-Icon':{ color:K.malIco },
      '.Culqi-message-info':{ background:K.campo, color:K.apoyo, border:'1px solid ' + K.raya },
      '.Culqi-message-warning':{ background:K.suave, color:K.texto, border:'1px solid ' + K.acento }, '.Culqi-message-warning .Culqi-Icon':{ color:K.acento },
      '.Culqi-message-success':{ background:K.campo, color:K.texto, border:'1px solid ' + K.raya },
      '.Culqi-Text-Error':{ color:K.malIco }, '.Culqi-Text-Link':{ color:K.acento }
    };
    // la tipografía del sitio también dentro del formulario
    reglas['@font-face { font-family: Jost; font-weight: 300 600; font-display: swap; src: url(https://fonts.gstatic.com/s/jost/v20/92zatBhPNqw73oTd4g.woff2) format("woff2"); } .gd-fuente'] = { display:'block' };
    if(o.contenedor){ var marco = document.querySelector(o.contenedor); if(marco) marco.style.background = K.fondo; }
    var Culqi = new window.CulqiCheckout(c.pk, {
      settings: { title:'Giandeco Studio Design', currency:'PEN', amount:c.monto },
      client: { email:c.cliente.email },
      options: { lang:'es', installments:true, modal:!o.contenedor, container:o.contenedor || undefined, paymentMethods:medios, paymentMethodsSort:Object.keys(medios) },
      appearance: {
        theme:'default', hiddenCulqiLogo:false, hiddenBannerContent:!!o.contenedor, hiddenBanner:!!o.contenedor, hiddenToolBarAmount:!!o.contenedor,
        menuType:'sliderTop', buttonCardPayText:'Pagar',   // Culqi añade el monto
        logo:'https://giandeco.com/images/firma/logo-giandeco-oficial.png',
        defaultStyle:{ bannerColor:K.fondo, buttonBackground:'#C9A24A', menuColor:K.acento, linksColor:K.acento, buttonTextColor:'#0A0A09', priceColor:K.acento },
        variables:{ fontFamily:FUENTE, borderRadius:'2px', colorBackground:K.fondo, colorPrimary:K.acento, colorPrimaryText:'#0A0A09',
                    colorText:K.texto, colorTextSecondary:K.apoyo, colorTextPlaceholder:K.guia, colorIconTab:K.texto, colorLogo:K.logo },
        rules: reglas
      }
    });
    actual = Culqi;
    Culqi.culqi = function(){
      if(Culqi.token){
        token = Culqi.token.id;
        var m = Culqi.token.metadata || {};
        cuotas = parseInt(m.installments, 10) || 0;
        try{ Culqi.close(); }catch(e){}
        cobrar();
      } else if(Culqi.error){
        // el propio formulario muestra el error y deja corregir
      }
    };
    if(tresDS){
      try{ tresDS.publicKey = c.pk; }catch(e){}
      Promise.resolve().then(function(){ return tresDS.generateDevice(); }).then(function(d){ device = d || null; }).catch(function(){})
        .then(function(){ Culqi.open(); });
    } else Culqi.open();
  }).catch(function(){
    terminar({ ok:false, mensaje:'No se pudo abrir el formulario de pago. Revise su conexión e inténtelo de nuevo.' });
  });
}

window.GD_PAGO = {
  estado: estado, consulta: consulta, pagar: pagar,
  cerrar: function(){ try{ if(actual) actual.close(); }catch(e){} actual = null; },
  activa: function(){ return T.db('pasarela') === true; },
  /* medios que se cobran en línea cuando hay pasarela */
  EN_LINEA: ['tarjeta', 'cuotas', 'yape']
};
})();
