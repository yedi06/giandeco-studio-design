/* ==========================================================================
   GIANDECO — ESTADO DE UN PEDIDO (fuente única)

   Un pedido avanza por DOS ejes que antes se mezclaban en la palabra
   «Registrado»:

     · PAGO     →  Pago pendiente · Pagado · A cotizar (sin importe aún)
     · ENTREGA  →  Registrado · Confirmado · En preparación ·
                   En camino / Listo para recoger · Entregado / Recogido
                   (y «Cancelado», que es un cierre aparte)

   Esta función los combina en un único objeto que usan Mi cuenta, el
   seguimiento público y el panel del estudio, para que el cliente y el
   personal lean siempre lo mismo:

     S.de(p) → { rec, cancel, cot, pagado, e, etapas, etapa, fin, vivo,
                 pago:{ k, t, tono },        // chip de pago
                 sig:{ t, d, tono, acc[] },   // «qué pasa ahora» para el cliente
                 dicho,                       // frase corta del avance
                 estudio:{ k, t, urg } }      // «qué hacer» para el personal

   No guarda nada ni toca la base de datos: solo interpreta `estado`,
   `pagado`, `subtotal`, `entrega` y `pagoKey` del pedido.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA; if(!T) return;

var ENVIO  = ['Registrado', 'Confirmado por el estudio', 'En preparación', 'En camino', 'Entregado'];
var RECOJO = ['Registrado', 'Confirmado por el estudio', 'En preparación', 'Listo para recoger', 'Recogido'];

function pasarela(){ return T.db('pasarela') === true; }
function acc(t, href, pri, ext){ return { t:t, href:href, pri:!!pri, ext:!!ext }; }

function de(p){
  p = p || {};
  var ent = p.entrega || {}, n = p.n || '';
  var rec = ent.tipo === 'recojo';
  var cancel = p.estado === 5;
  var e = Math.max(0, Math.min(+p.estado || 0, 4));
  var cot = !p.subtotal;
  var pagado = p.pagado === true;
  var directo = p.pagoKey === 'directo';
  var etapas = rec ? RECOJO : ENVIO;

  /* ---- eje del pago ---- */
  var pago = pagado ? { k:'pagado', t:'Pagado', tono:'ok' }
           : cancel ? { k:'anulado', t:'Sin cobro', tono:'neutro' }
           : cot    ? { k:'cotizar', t:'A cotizar', tono:'neutro' }
                    : { k:'pendiente', t:'Pago pendiente', tono:'pend' };

  /* ---- «qué pasa ahora» para el cliente ---- */
  var sig;
  if(cancel){
    sig = { tono:'mal', t:'Pedido cancelado',
      d: pagado ? 'Este pedido fue cancelado. Como tenía un pago registrado, el estudio coordinará la devolución con usted por WhatsApp.'
                : 'Este pedido fue cancelado y no se le cobró nada. Si fue un error, escríbanos y lo retomamos.',
      acc:[ acc('Escribir al estudio', T.wa('Hola Giandeco, tengo una consulta sobre mi pedido cancelado ' + n + '.'), false, true) ] };
  } else if(cot){
    sig = { tono:'espera', t:'Cotización en revisión',
      d:'Estamos preparando su cotización con el detalle por pieza. La recibirá por WhatsApp; hasta entonces no tiene nada que pagar.', acc:[] };
  } else if(!pagado){
    if(directo){
      sig = { tono:'accion', t:'Falta su pago',
        d:'Pague por Yape o transferencia con los datos de Giandeco y envíenos el comprobante por WhatsApp. En cuanto lo verifiquemos, confirmamos su pedido.',
        acc:[ acc('Ver datos de pago', 'checkout?ok=' + encodeURIComponent(n), true),
              acc('Enviar comprobante', T.wa('Hola Giandeco, ya pagué mi pedido ' + n + '. Les envío el comprobante.'), false, true) ] };
    } else if(pasarela()){
      sig = { tono:'accion', t:'Falta su pago',
        d:'Pague con tarjeta, de forma segura, con Izipay. Su pedido se confirma en cuanto el pago es aprobado.',
        acc:[ acc('Pagar ahora', 'pagar?n=' + encodeURIComponent(n), true) ] };
    } else {
      sig = { tono:'accion', t:'Falta su pago',
        d:'El pago en línea no está disponible en este momento. Escríbanos y le indicamos cómo pagar.',
        acc:[ acc('Escribir por WhatsApp', T.wa('Hola Giandeco, quiero pagar mi pedido ' + n + '.'), true, true) ] };
    }
  } else if(e === 0){
    sig = { tono:'espera', t:'Pago recibido',
      d:'Estamos confirmando disponibilidad, envío y fecha de entrega. Le avisaremos por WhatsApp; no necesita hacer nada más.', acc:[] };
  } else if(e === 1){
    sig = { tono:'espera', t:'Pedido confirmado',
      d:'El estudio confirmó su pedido y en breve empieza a prepararlo.', acc:[] };
  } else if(e === 2){
    sig = { tono:'espera', t:'Estamos preparando su pedido',
      d:'Alistamos sus piezas con cuidado. Le avisaremos cuando ' + (rec ? 'estén listas para recoger.' : 'salgan a reparto.'), acc:[] };
  } else if(e === 3){
    sig = rec
      ? { tono:'accion', t:'Listo para recoger', d:'Su pedido ya está listo. Puede recogerlo en Giandeco; lleve su número de pedido.', acc:[] }
      : { tono:'espera', t:'Su pedido va en camino',
          d: ent.porAgencia ? 'Lo despachamos por agencia' + (ent.agencia ? ' (' + ent.agencia + ')' : '') + '. El flete se lo cobra la agencia al ' + (ent.destino === 'oficina' ? 'recogerlo' : 'recibirlo') + '.'
                            : 'Ya salió a reparto. Cualquier cambio de horario se lo avisamos por WhatsApp.', acc:[] };
  } else {
    sig = { tono:'ok', t: rec ? 'Pedido recogido' : 'Pedido entregado',
      d:'Gracias por su compra. Si algo no es como esperaba, escríbanos; y puede dejar su opinión de cada pieza.', acc:[] };
  }

  /* ---- frase corta del avance (solo el eje de la entrega) ---- */
  var DICHO = ['Su pedido fue registrado', 'El estudio confirmó su pedido', 'Su pedido está en preparación',
    rec ? 'Su pedido está listo para recoger' : 'Su pedido va en camino', rec ? 'Recogió su pedido' : 'Su pedido fue entregado'];

  /* ---- «qué hacer» para el personal del estudio ---- */
  var est;
  if(cancel) est = { k:'nada', t:'', urg:false };
  else if(cot && e === 0) est = { k:'cotizar', t:'Enviar cotización', urg:true };
  else if(cot) est = { k:'nada', t:'', urg:false };
  else if(!pagado) est = { k:'cobrar', t: directo ? 'Esperar comprobante' : 'Esperar pago en línea', urg:false };
  else if(e === 0) est = { k:'confirmar', t:'Confirmar pedido', urg:true };
  else if(e === 1) est = { k:'preparar', t:'Preparar', urg:false };
  else if(e === 2) est = { k:'despachar', t: rec ? 'Dejar listo para recoger' : 'Despachar', urg:false };
  else if(e === 3) est = { k:'entregar', t: rec ? 'Entregar al cliente' : 'Confirmar entrega', urg:false };
  else est = { k:'nada', t:'', urg:false };

  return { rec:rec, cancel:cancel, cot:cot, pagado:pagado, directo:directo, e:e, etapas:etapas,
    etapa: cancel ? 'Cancelado' : etapas[e], fin: !cancel && e === 4, vivo: !cancel && e < 4,
    pago:pago, sig:sig, dicho: cancel ? 'Pedido cancelado' : DICHO[e], estudio:est };
}

window.GD_ESTADO = { de:de, ENVIO:ENVIO, RECOJO:RECOJO };
})();
