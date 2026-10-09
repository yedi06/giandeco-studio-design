/* ==========================================================================
   GIANDECO — CAPA DE TIENDA
   Selección (carrito), favoritos, recomendaciones, pedidos, cuenta y
   opiniones. Se apoya en los catálogos que publica js/giandeco.js
   (GD_PRODUCTOS, GD_ILUMINACION, GD_NAVIDAD) y no los duplica.

   Todo lo que hoy se guarda vive en este dispositivo (localStorage) detrás
   de un único punto: db(). El día que haya servidor, se cambia db() y las
   páginas no se enteran.

   Lo que el estudio configura está en CFG, arriba, y en ningún otro sitio.
   ========================================================================== */
(function(){
'use strict';
if(window.GD_TIENDA) return;

/* --------------------------------------------------------------------------
   1. CONFIGURACIÓN DEL ESTUDIO
   Una tarifa en null se muestra como "por confirmar": nunca se inventa un
   monto. Un enlace legal vacío no se pinta.
   -------------------------------------------------------------------------- */
var CFG = {
  WA: '51920775559',
  PRECIOS_CON_IGV: true,
  RECOJO: { activo:true, lugar:'Estudio Giandeco', dir:'Ca. Las Bellísimas 170, Urb. Vipol — Callao' },
  ENVIO: [
    { key:'lima',      label:'Lima Metropolitana', tarifa:null },
    { key:'callao',    label:'Callao',             tarifa:null },
    { key:'provincia', label:'Otra provincia',     tarifa:null, nota:'Se coordina bajo cotización.' }
  ],
  /* Medios de pago. activo:false lo quita del checkout sin tocar nada más.
     · solo:        zonas de envío donde aplica
     · soloRecojo / soloFactura: aparece únicamente en ese caso
     Tarjeta, cuotas y PagoEfectivo se cobran con el enlace de pago de la
     pasarela que contrate el estudio; esta web nunca recibe datos de tarjeta. */
  PAGO: [
    { key:'yape',     activo:true, grupo:'Billeteras digitales', label:'Yape', nota:'Paga con QR o al número del estudio. Se lo enviamos por WhatsApp al confirmar el pedido.' },
    { key:'plin',     activo:true, grupo:'Billeteras digitales', label:'Plin', nota:'Desde la app de su banco afiliado a Plin, con QR o número.' },
    { key:'tarjeta',  activo:true, grupo:'Tarjetas', label:'Tarjeta de crédito o débito', marcas:'Visa · Mastercard · American Express · Diners Club', nota:'Paga en un enlace seguro de la pasarela. Sus datos de tarjeta no pasan por esta web.' },
    { key:'cuotas',   activo:true, grupo:'Tarjetas', label:'Cuotas con tarjeta de crédito', nota:'Elige el número de cuotas en el mismo enlace seguro, según las condiciones de su banco.' },
    { key:'transf',   activo:true, grupo:'Banca', label:'Transferencia o depósito bancario', nota:'Le enviamos el número de cuenta en soles y el CCI para transferencias interbancarias.' },
    { key:'pagoefectivo', activo:true, grupo:'Banca', label:'PagoEfectivo', nota:'Recibe un código CIP y paga desde su banca por internet o en agentes y bodegas.' },
    { key:'contra',   activo:true, grupo:'Al recibir', label:'Pago contra entrega', nota:'Paga al recibir su pedido, en efectivo, con Yape o con tarjeta. Solo en Lima y Callao.', solo:['lima','callao'] },
    { key:'enestudio',activo:true, grupo:'Al recibir', label:'Pago al recoger en el estudio', nota:'Paga al recoger, en efectivo, con Yape, Plin o tarjeta.', soloRecojo:true },
    { key:'adelanto', activo:true, grupo:'Proyectos y empresas', label:'Adelanto y saldo', nota:'Para piezas por encargo o pedidos de proyecto: una parte al confirmar y el saldo antes de la entrega. El estudio le indica los montos.' },
    { key:'empresa',  activo:true, grupo:'Proyectos y empresas', label:'Orden de compra de empresa', nota:'Para compras con factura: coordinamos orden de compra y condiciones de pago.', soloFactura:true }
  ],
  /* Códigos de descuento:  { 'BIENVENIDA': { pct:10 } }  o  { 'ENVIO': { monto:30 } }.
     Vacío = el campo de cupón no se muestra. */
  CUPONES: {},
  /* Datos legales del estudio. Lo que esté vacío se muestra como
     "por confirmar" en las páginas de ayuda y en el libro de reclamaciones. */
  EMPRESA: { razon:'', ruc:'', dir:'Ca. Las Bellísimas 170, Urb. Vipol — Callao 07036', correo:'contacto@giandeco.com', tel:'+51 920 775 559' },
  /* En false, las páginas de políticas llevan el aviso "borrador pendiente
     de validación". Se pasa a true cuando el estudio las aprueba. */
  LEGAL_VALIDADO: false,
  CAMBIO_DIAS: null,
  GOOGLE_RESENAS: '',
  LEGAL: { terminos:'terminos-y-condiciones.html', privacidad:'politica-de-privacidad.html', libro:'libro-de-reclamaciones.html' },
  /* Opiniones aprobadas por el estudio. Solo entran aquí las de compras
     reales:  { producto:'comoda-flow', autor:'María', lugar:'Surco',
     fecha:'2026-11-02', notas:{pieza:5,foto:5,entrega:4,atencion:5},
     texto:'…', ambiente:'Dormitorio' } */
  OPINIONES: [],
  /* Testimonios de proyecto autorizados por el cliente:
     { autor:'…', rol:'Gerente de tienda · Marca', proyecto:'…',
       href:'retail-proyectos.html', antes:'…', despues:'…' } */
  TESTIMONIOS: [],
  /* Preguntas respondidas por el estudio:
     { producto:'comoda-flow', p:'¿…?', r:'…', fecha:'2026-11-02' } */
  PREGUNTAS: []
};

/* Lo que el estudio cambió desde admin.html pisa los valores de arriba. */
(function(o){
  if(!o) return;
  if(o.EMPRESA) Object.keys(o.EMPRESA).forEach(function(k){ if(o.EMPRESA[k]) CFG.EMPRESA[k] = o.EMPRESA[k]; });
  ['PRECIOS_CON_IGV', 'LEGAL_VALIDADO', 'GOOGLE_RESENAS', 'CUPONES', 'OPINIONES', 'PREGUNTAS', 'TESTIMONIOS'].forEach(function(k){ if(o[k] !== undefined && o[k] !== null) CFG[k] = o[k]; });
  if(o.RECOJO_ACTIVO !== undefined) CFG.RECOJO.activo = o.RECOJO_ACTIVO;
  if(o.ENVIO) CFG.ENVIO.forEach(function(z){ if(o.ENVIO[z.key] !== undefined) z.tarifa = o.ENVIO[z.key]; });
  if(o.PAGO) CFG.PAGO.forEach(function(m){ if(o.PAGO[m.key] === false) m.activo = false; });
})(db('config'));

/* --------------------------------------------------------------------------
   2. UTILIDADES
   -------------------------------------------------------------------------- */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
function slug(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function num(precio){ var n = parseFloat(String(precio).replace(/[^0-9.]/g,'')); return isNaN(n) ? null : n; }
function fmt(n){ return 'S/ ' + Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function wa(msg){ return 'https://wa.me/' + CFG.WA + '?text=' + encodeURIComponent(msg); }
function db(k, v){
  try{
    if(v === undefined){ var r = localStorage.getItem('gd.' + k); return r ? JSON.parse(r) : null; }
    if(v === null) localStorage.removeItem('gd.' + k); else localStorage.setItem('gd.' + k, JSON.stringify(v));
  }catch(e){ return null; }
}
function emitir(n){ try{ document.dispatchEvent(new CustomEvent('gd:' + n)); }catch(e){} }
var FLECHA = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

/* --------------------------------------------------------------------------
   3. CATÁLOGO UNIFICADO
   -------------------------------------------------------------------------- */
var COND = 'Los precios no incluyen instalación ni envío. Entrega en Lima y Callao; coordinamos provincia bajo cotización.';
var LINEAS = {
  muebleria:   { label:'Mueblería',   href:'catalogo-muebleria.html',   src:'GD_PRODUCTOS' },
  iluminacion: { label:'Iluminación', href:'catalogo-iluminacion.html', src:'GD_ILUMINACION' },
  navidad:     { label:'Navidad',     href:'catalogo-navidad.html',     src:'GD_NAVIDAD' }
};

/* lo que la ficha corta no dice: segunda foto, familia de variantes y el
   largo (cm) cuando el propio nombre de la pieza lo declara */
var EXTRA = {
  'centro-deluxe':   { gal:['images/mobiliario/centro-deluxe-2.webp'], tv:75 },
  'centro-burnie':   { gal:['images/mobiliario/centro-burnie-2.webp'], tv:70 },
  'comoda-flow':     { gal:['images/mobiliario/comoda-flow-2.webp'] },
  'comedor-city12':  { fam:'Comedor City Bouclé', v:'1.20 m · 4 personas', largo:120 },
  'comedor-city180': { fam:'Comedor City Bouclé', v:'1.80 m · 6 personas', largo:180 },
  'comedor-living16':{ largo:160 },
  'mesa-sara-canela':{ fam:'Mesa Sara 1.2', v:'Canela', largo:120 },
  'mesa-sara-vidrio':{ fam:'Mesa Sara 1.2', v:'Vidrio Off White', largo:120 },
  'ropero-bilbao-crema':  { fam:'Ropero Bilbao', v:'Crema' },
  'ropero-bilbao-rouble': { fam:'Ropero Bilbao', v:'Rouble' },
  'ropero-porto-blanco':  { fam:'Ropero Porto',  v:'Blanco' },
  'ropero-porto-rouble':  { fam:'Ropero Porto',  v:'Rouble' },
  'amaris':          { largo:105 },
  'portavela-dorado':{ fam:'Portavela', v:'Dorado' },
  'portavela-negro': { fam:'Portavela', v:'Negro' },
  'farol-124':       { fam:'Farol', v:'1.24 m' },
  'farol-157':       { fam:'Farol', v:'1.57 m' },
  'casa-iluminada-mediana': { fam:'Casa navideña iluminada', v:'Mediana' },
  'casa-iluminada-pequena': { fam:'Casa navideña iluminada', v:'Pequeña' },
  'venado-mediano':  { fam:'Venado transparente', v:'Mediano' },
  'venado-pequeno':  { fam:'Venado transparente', v:'Pequeño' },
  'reno-recostado':  { fam:'Reno navideño', v:'Recostado' },
  'reno-de-pie':     { fam:'Reno navideño', v:'De pie' },
  'reno-recostado-plato': { fam:'Reno con plato', v:'Recostado' },
  'reno-de-pie-plato':    { fam:'Reno con plato', v:'De pie' }
};

var CAT = {};
Object.keys(LINEAS).forEach(function(l){
  var src = window[LINEAS[l].src] || {};
  Object.keys(src).forEach(function(k){
    var p = src[k], x = EXTRA[k] || {};
    CAT[k] = {
      key:k, linea:l, nombre:p.nombre, cat:p.cat, precio:p.precio, valor:num(p.precio),
      img:p.img, nota:p.nota || '', gal:[p.img].concat(x.gal || []),
      fam:x.fam || '', v:x.v || '', largo:x.largo || 0, tv:x.tv || 0
    };
  });
});
/* las piezas añadidas desde el panel aún no tienen página generada */
function url(key){ return (window.GD_NUEVOS || []).indexOf(key) !== -1 ? 'producto.html?p=' + encodeURIComponent(key) : 'producto-' + key + '.html'; }
function familia(key){
  var p = CAT[key]; if(!p || !p.fam) return [];
  return Object.keys(CAT).filter(function(k){ return CAT[k].fam === p.fam; });
}

/* --------------------------------------------------------------------------
   4. RECOMENDACIONES
   Reglas de estudio, no de algoritmo: qué pieza resuelve lo que la anterior
   deja abierto. Cada regla dice por qué, y ese porqué se le muestra al
   cliente.
   -------------------------------------------------------------------------- */
var COMBINA = {
  'Comedor':            [['iluminacion','Colgante lineal','La luz que centra la mesa'], ['iluminacion','Colgante múltiple','Otra forma de iluminar el comedor'], ['navidad','Portavelas','Para vestir la mesa'], ['navidad','Mesa','Para servir en temporada']],
  'Centro de TV':       [['iluminacion','Colgante individual','Luz puntual para la sala'], ['muebleria','Comedor','El ambiente contiguo, en el mismo lenguaje'], ['navidad','Portavelas','Un acento sobre la repisa']],
  'Dormitorio':         [['muebleria','Dormitorio','Guardado que completa el dormitorio'], ['iluminacion','Colgante individual','Luz cálida junto a la cama'], ['muebleria','Centro de TV','Si el dormitorio lleva pantalla']],
  'Colgante lineal':    [['muebleria','Comedor','La mesa que pide esta lámpara'], ['iluminacion','Colgante individual','Luz de apoyo en el mismo ambiente'], ['navidad','Portavelas','Para vestir la mesa']],
  'Colgante múltiple':  [['muebleria','Comedor','La mesa que pide esta lámpara'], ['iluminacion','Colgante individual','Luz de apoyo en el mismo ambiente'], ['muebleria','Centro de TV','Para la sala contigua']],
  'Colgante individual':[['muebleria','Dormitorio','El mueble que acompaña'], ['muebleria','Centro de TV','Para la sala'], ['iluminacion','Colgante múltiple','La pieza principal del ambiente']]
};
var COMBINA_NAVIDAD = [['navidad','Portavelas','Luz de vela para la mesa'], ['navidad','Farol','Para la entrada o la terraza'], ['navidad','Iluminados','Un punto de luz en la repisa'], ['navidad','Adornos','Para agrupar en tres alturas'], ['navidad','Mesa','Para servir en temporada']];

function complementos(key, max){
  var p = CAT[key]; if(!p) return [];
  var reglas = p.linea === 'navidad' ? COMBINA_NAVIDAD : (COMBINA[p.cat] || []);
  var fuera = familia(key).concat([key]), out = [];
  reglas.forEach(function(r){
    if(out.length >= (max || 3)) return;
    if(r[0] === p.linea && r[1] === p.cat && p.linea === 'navidad') return;
    var c = Object.keys(CAT).filter(function(k){
      var q = CAT[k];
      return q.linea === r[0] && q.cat === r[1] && q.valor !== null && fuera.indexOf(k) === -1;
    });
    if(!c.length) return;
    // la más cercana en precio: no se le propone a una pieza de S/ 60 una de S/ 3,500
    c.sort(function(a, b){ return Math.abs(CAT[a].valor - (p.valor || 0)) - Math.abs(CAT[b].valor - (p.valor || 0)); });
    var k = c[0];
    fuera = fuera.concat(familia(k)).concat([k]);
    out.push({ key:k, porque:r[2] });
  });
  return out;
}
function similares(key, max){
  var p = CAT[key]; if(!p) return [];
  var fuera = [key];
  return Object.keys(CAT).filter(function(k){ return fuera.indexOf(k) === -1 && CAT[k].linea === p.linea; })
    .sort(function(a, b){
      var A = CAT[a], B = CAT[b];
      var da = (A.cat === p.cat ? 0 : 1e6) + Math.abs((A.valor || 0) - (p.valor || 0));
      var dbb = (B.cat === p.cat ? 0 : 1e6) + Math.abs((B.valor || 0) - (p.valor || 0));
      return da - dbb;
    }).slice(0, max || 4);
}

/* para páginas sin pieza de referencia: parte de lo que el cliente vio,
   guardó o tiene en su selección; si no hay rastro, los destacados */
var DESTACADOS = ['centro-deluxe', 'longer', 'comedor-city12', 'casa-jengibre', 'comoda-flow', 'basilea', 'farol-157', 'lara'];
function recomendados(max){
  max = max || 4;
  var base = carrito.lineas().map(function(x){ return x.key; }).concat(favs.lista(), vistos.lista()).filter(function(k){ return CAT[k]; });
  var fuera = carrito.lineas().map(function(x){ return x.id; }), out = [];
  function meter(k){ if(CAT[k] && out.indexOf(k) === -1 && fuera.indexOf(k) === -1 && out.length < max) out.push(k); }
  base.forEach(function(k){ complementos(k, 2).forEach(function(c){ meter(c.key); }); });
  base.forEach(function(k){ similares(k, 2).forEach(meter); });
  DESTACADOS.forEach(meter);
  return out;
}

/* espacios montados por el estudio, como inspiración por línea */
var ESPACIOS = [
  { nombre:'Sala de estar · paleta dorada', meta:'Producción Giandeco', img:'images/espacios/zara-sala-1.jpg',        href:'espacio-sala-dorada.html',      lineas:['muebleria','iluminacion'] },
  { nombre:'Comedor de exterior',           meta:'Producción Giandeco', img:'images/espacios/zara-comedor-1.jpg',     href:'espacio-comedor-exterior.html', lineas:['muebleria'] },
  { nombre:'Sala Casacor 2025',             meta:'Feria Casacor 2025',  img:'images/proyectos/casacor-3.jpg',         href:'espacio-casacor.html',          lineas:['iluminacion','muebleria'] },
  { nombre:'Mesa servida · campaña navideña', meta:'Campaña estacional', img:'images/espacios/zara-navidad-1.jpg?v=2', href:'espacio-mesa-navidena.html',   lineas:['navidad'] },
  { nombre:'Lounge Mássimo Café',           meta:'Gastronomía',         img:'images/work/massimo.jpg',                href:'espacio-massimo.html',          lineas:['iluminacion','navidad'] }
];
function espaciosDe(key){
  var p = CAT[key]; if(!p) return [];
  return ESPACIOS.filter(function(e){ return e.lineas.indexOf(p.linea) !== -1; }).slice(0, 2);
}

/* --------------------------------------------------------------------------
   5. SELECCIÓN  (carrito)
   Admite piezas con precio y piezas "a cotizar" en la misma lista: en este
   rubro el cliente arma un ambiente, no un ticket.
   -------------------------------------------------------------------------- */
var carrito = {
  lineas: function(){ return db('carrito') || []; },
  guardar: function(l){ db('carrito', l); pintarCajon(); emitir('carrito'); },
  add: function(item, qty){
    var l = carrito.lineas(), q = Math.max(1, qty || 1), i;
    for(i = 0; i < l.length; i++){ if(l[i].id === item.id){ l[i].qty = Math.min(99, l[i].qty + q); carrito.guardar(l); return; } }
    item.qty = q; l.push(item); carrito.guardar(l);
  },
  addKey: function(key, qty){
    var p = CAT[key]; if(!p) return false;
    carrito.add({ id:key, key:key, nombre:p.nombre, cat:p.cat, precio:p.precio, valor:p.valor, img:p.img, href:url(key) }, qty);
    return true;
  },
  addEspacio: function(nombre, cat, origen){
    carrito.add({ id:'esp:' + slug(nombre), nombre:nombre, cat:cat || 'Pieza de espacio', precio:'A cotizar', valor:null, img:'', href:origen || '', origen:origen || '' }, 1);
  },
  qty: function(id, q){
    var l = carrito.lineas().map(function(x){ if(x.id === id) x.qty = Math.max(1, Math.min(99, q)); return x; });
    carrito.guardar(l);
  },
  quitar: function(id){ carrito.guardar(carrito.lineas().filter(function(x){ return x.id !== id; })); },
  vaciar: function(){ carrito.guardar([]); },
  total: function(l){
    l = l || carrito.lineas();
    var t = { piezas:0, subtotal:0, cotizar:0 };
    l.forEach(function(x){ t.piezas += x.qty; if(x.valor === null) t.cotizar += 1; else t.subtotal += x.valor * x.qty; });
    return t;
  }
};

var favs = {
  lista: function(){ return db('favs') || []; },
  es: function(k){ return favs.lista().indexOf(k) !== -1; },
  alternar: function(k){
    var l = favs.lista(), i = l.indexOf(k);
    if(i === -1) l.push(k); else l.splice(i, 1);
    db('favs', l); emitir('favs'); return i === -1;
  }
};
var vistos = {
  lista: function(){ return (db('vistos') || []).filter(function(k){ return CAT[k]; }); },
  marcar: function(k){ var l = vistos.lista().filter(function(x){ return x !== k; }); l.unshift(k); db('vistos', l.slice(0, 8)); }
};

/* --------------------------------------------------------------------------
   6. CUENTA, PEDIDOS Y OPINIONES
   -------------------------------------------------------------------------- */
var sesion = {
  get: function(){ return db('sesion'); },
  set: function(s){ db('sesion', s); emitir('sesion'); },
  salir: function(){ db('sesion', null); emitir('sesion'); }
};

var ESTADOS = ['Registrado', 'Confirmado por el estudio', 'En preparación', 'En camino', 'Entregado'];
var pedidos = {
  lista: function(){ return db('pedidos') || []; },
  get: function(n){ return pedidos.lista().filter(function(p){ return p.n === n; })[0] || null; },
  crear: function(d){
    var f = new Date(), p2 = function(x){ return ('0' + x).slice(-2); };
    d.n = 'GD-' + String(f.getFullYear()).slice(2) + p2(f.getMonth() + 1) + p2(f.getDate()) + '-' + Math.floor(1000 + Math.random() * 9000);
    d.fecha = f.toISOString(); d.estado = 0;
    var l = pedidos.lista(); l.unshift(d); db('pedidos', l);
    return d;
  },
  mensaje: function(p){
    var soloCot = !p.subtotal;
    var m = 'Hola Giandeco, ' + (soloCot ? 'quiero cotizar esta selección' : 'quiero confirmar mi pedido') + ' ' + p.n + '.\n\n';
    p.items.forEach(function(x){ m += '• ' + x.qty + ' × ' + x.nombre + ' — ' + (x.valor === null ? 'a cotizar' : fmt(x.valor * x.qty)) + '\n'; });
    m += '\n';
    if(p.subtotal) m += 'Subtotal: ' + fmt(p.subtotal) + (p.cotizar ? ' (+ ' + p.cotizar + ' a cotizar)' : '') + '\n';
    m += 'Entrega: ' + p.entrega.resumen + '\n';
    if(p.entrega.armado) m += 'Armado / instalación: sí, cotizar\n';
    if(p.entrega.recibe) m += 'Recibe: ' + p.entrega.recibe + '\n';
    if(p.entrega.horario) m += 'Horario preferido: ' + p.entrega.horario + '\n';
    if(p.descuento) m += 'Cupón ' + p.cupon + ': −' + fmt(p.descuento) + '\n';
    if(p.pago) m += 'Pago: ' + p.pago + '\n';
    m += 'Comprobante: ' + p.comprobante.resumen + '\n';
    m += 'Nombre: ' + p.cliente.nombre + ' · Cel. ' + p.cliente.cel + ' · ' + p.cliente.email;
    if(p.nota) m += '\nNota: ' + p.nota;
    return m;
  },
  /* ¿este dispositivo registró una compra de esa pieza? */
  conProducto: function(key){
    return pedidos.lista().filter(function(p){ return p.items.some(function(x){ return x.key === key; }); })[0] || null;
  }
};

var CRITERIOS = [
  { k:'pieza',    t:'La pieza',           d:'Materiales y acabado' },
  { k:'foto',     t:'Fiel a la foto',     d:'Lo que llegó es lo que vio' },
  { k:'entrega',  t:'Entrega y armado',   d:'Puntualidad y cuidado' },
  { k:'atencion', t:'Atención del estudio', d:'Respuesta y asesoría' }
];
var opiniones = {
  publicadas: function(key){ return CFG.OPINIONES.filter(function(o){ return o.producto === key; }); },
  mias: function(){ return db('opiniones') || []; },
  mia: function(key){ return opiniones.mias().filter(function(o){ return o.producto === key; })[0] || null; },
  guardar: function(o){
    var l = opiniones.mias().filter(function(x){ return x.producto !== o.producto; });
    o.fecha = new Date().toISOString(); o.estado = 'en revisión'; l.unshift(o); db('opiniones', l);
  },
  promedio: function(o){ var s = 0; CRITERIOS.forEach(function(c){ s += o.notas[c.k] || 0; }); return s / CRITERIOS.length; },
  mensaje: function(o){
    var p = CAT[o.producto] || { nombre:o.producto };
    var m = 'Hola Giandeco, dejo mi opinión de la pieza ' + p.nombre + ' (pedido ' + o.pedido + ').\n\n';
    CRITERIOS.forEach(function(c){ m += c.t + ': ' + o.notas[c.k] + '/5\n'; });
    if(o.ambiente) m += 'La puse en: ' + o.ambiente + '\n';
    m += '\n' + o.texto + '\n\n' + (o.publicar ? 'Autorizo publicarla como ' + o.autor + (o.lugar ? ', ' + o.lugar : '') + '.' : 'Prefiero que no se publique.');
    return m;
  }
};

/* --------------------------------------------------------------------------
   7. TARJETA DE PRODUCTO
   -------------------------------------------------------------------------- */
function card(key, o){
  var p = CAT[key]; if(!p) return ''; o = o || {};
  return '<article class="gdt-card">' +
    '<a class="gd-prod" href="' + url(key) + '" data-cursor="Ver">' +
      '<span class="gd-prod-thumb">' +
        (p.valor === null ? '<span class="gd-prod-badge">A consultar</span>' : '') +
        '<img decoding="async" loading="lazy" src="' + p.img + '" alt="' + esc(p.nombre) + '"></span>' +
      '<span class="gd-prod-cat">' + esc(p.cat) + '</span>' +
      '<span class="gd-prod-name">' + esc(p.nombre) + '</span>' +
      '<span class="gd-prod-price">' + esc(p.precio) + '</span>' +
    '</a>' +
    (o.porque ? '<p class="gdt-card-why">' + esc(o.porque) + '</p>' : '') +
    (o.sinBoton ? '' : '<button type="button" class="gdt-quick" data-gdt-add="' + key + '">' + (p.valor === null ? 'Añadir para cotizar' : 'Añadir a mi selección') + '</button>') +
  '</article>';
}

/* --------------------------------------------------------------------------
   8. CAJÓN DE SELECCIÓN
   -------------------------------------------------------------------------- */
var cajon, velo, antesDeAbrir = null;

function lineaHTML(x){
  return '<li class="gdt-line">' +
    (x.img ? '<a class="gdt-line-img" href="' + esc(x.href || '#') + '"><img decoding="async" src="' + esc(x.img) + '" alt=""></a>'
           : '<span class="gdt-line-img is-vacia" aria-hidden="true">G</span>') +
    '<div class="gdt-line-body">' +
      '<span class="gdt-line-cat">' + esc(x.cat) + '</span>' +
      (x.href ? '<a class="gdt-line-name" href="' + esc(x.href) + '">' + esc(x.nombre) + '</a>' : '<span class="gdt-line-name">' + esc(x.nombre) + '</span>') +
      '<div class="gdt-line-row">' +
        '<span class="gdt-qty" role="group" aria-label="Cantidad">' +
          '<button type="button" data-gdt-qty="-1" data-id="' + esc(x.id) + '" aria-label="Quitar una">−</button>' +
          '<b>' + x.qty + '</b>' +
          '<button type="button" data-gdt-qty="1" data-id="' + esc(x.id) + '" aria-label="Añadir una">+</button>' +
        '</span>' +
        '<span class="gdt-line-price">' + (x.valor === null ? 'A cotizar' : fmt(x.valor * x.qty)) + '</span>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="gdt-line-x" data-gdt-quitar="' + esc(x.id) + '" aria-label="Quitar ' + esc(x.nombre) + '">&times;</button>' +
  '</li>';
}

function pintarCajon(){
  var l = carrito.lineas(), t = carrito.total(l);
  document.querySelectorAll('.gdt-badge').forEach(function(b){ b.textContent = t.piezas; b.hidden = !t.piezas; });
  if(!cajon) return;
  cajon.querySelector('#gdtCount').textContent = t.piezas ? (t.piezas + (t.piezas === 1 ? ' pieza' : ' piezas')) : '';
  var cuerpo = cajon.querySelector('#gdtBody'), pie = cajon.querySelector('#gdtFoot');
  if(!l.length){
    cuerpo.innerHTML = '<div class="gdt-vacio"><p class="gdt-vacio-t">Su selección está vacía</p>' +
      '<p>Añada piezas del catálogo o toque un punto sobre la foto de un espacio.</p>' +
      '<a class="gd-btn gd-btn-primary" href="catalogo.html">Ver el catálogo' + FLECHA + '</a>' +
      '<a class="gd-link" href="catalogo-compra-el-espacio.html">Compra el espacio' + FLECHA + '</a></div>';
    pie.innerHTML = ''; return;
  }
  // una sugerencia, la de la última pieza añadida, y solo si no está ya dentro
  var ult = l[l.length - 1], sug = '';
  if(ult.key){
    var c = complementos(ult.key, 3).filter(function(r){ return !l.some(function(x){ return x.id === r.key; }); })[0];
    if(c){
      var q = CAT[c.key];
      sug = '<div class="gdt-sug"><span class="gdt-sug-t">' + esc(c.porque) + '</span>' +
        '<div class="gdt-sug-row"><a href="' + url(c.key) + '"><img decoding="async" src="' + q.img + '" alt=""></a>' +
        '<span><a href="' + url(c.key) + '">' + esc(q.nombre) + '</a><i>' + esc(q.precio) + '</i></span>' +
        '<button type="button" data-gdt-add="' + c.key + '" data-quieto>Añadir</button></div></div>';
    }
  }
  cuerpo.innerHTML = '<ul class="gdt-lines">' + l.map(lineaHTML).join('') + '</ul>' + sug;
  var soloCot = !t.subtotal;
  pie.innerHTML =
    '<div class="gdt-tot"><span>Subtotal</span><b>' + (soloCot ? 'A cotizar' : fmt(t.subtotal)) + '</b></div>' +
    (t.cotizar && !soloCot ? '<p class="gdt-tot-nota">+ ' + t.cotizar + (t.cotizar === 1 ? ' pieza' : ' piezas') + ' a cotizar por el estudio.</p>' : '') +
    '<p class="gdt-tot-nota">Envío y armado se confirman en el siguiente paso.</p>' +
    '<a class="gd-btn gd-btn-primary" href="checkout.html">' + (soloCot ? 'Solicitar cotización' : 'Finalizar pedido') + FLECHA + '</a>' +
    '<button type="button" class="gdt-seguir" data-gdt-cerrar>Seguir viendo</button>';
}

function abrir(){
  if(!cajon) return;
  antesDeAbrir = document.activeElement;
  cajon.classList.add('is-open'); velo.classList.add('is-open');
  cajon.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
  cajon.querySelector('.gdt-x').focus();
}
function cerrar(){
  if(!cajon || !cajon.classList.contains('is-open')) return;
  cajon.classList.remove('is-open'); velo.classList.remove('is-open');
  cajon.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  if(antesDeAbrir && antesDeAbrir.focus) antesDeAbrir.focus();
}

function montar(){
  if(!document.querySelector('link[href*="gd-tienda.css"]')){
    var lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'css/gd-tienda.css?v=3';
    document.head.appendChild(lk);
  }
  document.body.insertAdjacentHTML('beforeend',
    '<div class="gdt-scrim" id="gdtScrim"></div>' +
    '<aside class="gdt-drawer" id="gdtDrawer" role="dialog" aria-modal="true" aria-label="Su selección" aria-hidden="true">' +
      '<header class="gdt-head"><div><span class="gdt-eyebrow">Su selección</span><b id="gdtCount"></b></div>' +
        '<button type="button" class="gdt-x" data-gdt-cerrar aria-label="Cerrar">&times;</button></header>' +
      '<div class="gdt-body" id="gdtBody"></div>' +
      '<footer class="gdt-foot" id="gdtFoot"></footer>' +
    '</aside>');
  cajon = document.getElementById('gdtDrawer'); velo = document.getElementById('gdtScrim');
  velo.addEventListener('click', cerrar);

  // el header ya trae el botón de carrito: se conecta, y a su lado entra la cuenta
  document.querySelectorAll('button[aria-label="Carrito"]').forEach(function(b){
    b.classList.add('gdt-cart-btn'); b.setAttribute('aria-label', 'Su selección');
    b.insertAdjacentHTML('beforeend', '<span class="gdt-badge" hidden></span>');
    b.addEventListener('click', abrir);
    b.insertAdjacentHTML('beforebegin',
      '<a class="sh-icon-btn gdt-cuenta" href="cuenta.html" aria-label="Mi cuenta">' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></svg></a>');
  });
  // en móvil la barra solo lleva buscar y selección (css/gd-movil.css): la cuenta entra al menú
  document.querySelectorAll('.sh-mobile-paginas').forEach(function(nav){
    if(!nav.querySelector('a[href="cuenta.html"]')) nav.insertAdjacentHTML('beforeend', '<a href="cuenta.html">Mi cuenta</a>');
  });

  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-gdt-add],[data-gdt-add-esp],[data-gdt-qty],[data-gdt-quitar],[data-gdt-cerrar],[data-gdt-fav],[data-gdt-abrir]');
    if(!t) return;
    if(t.hasAttribute('data-gdt-add')){
      e.preventDefault();
      if(carrito.addKey(t.getAttribute('data-gdt-add'), parseInt(t.getAttribute('data-qty'), 10) || 1)) abrir();
    } else if(t.hasAttribute('data-gdt-add-esp')){
      e.preventDefault();
      carrito.addEspacio(t.getAttribute('data-gdt-add-esp'), t.getAttribute('data-cat'), location.pathname.split('/').pop());
      abrir();
    } else if(t.hasAttribute('data-gdt-qty')){
      var id = t.getAttribute('data-id'), x = carrito.lineas().filter(function(y){ return y.id === id; })[0];
      if(x) carrito.qty(id, x.qty + parseInt(t.getAttribute('data-gdt-qty'), 10));
    } else if(t.hasAttribute('data-gdt-quitar')){
      carrito.quitar(t.getAttribute('data-gdt-quitar'));
    } else if(t.hasAttribute('data-gdt-cerrar')){
      cerrar();
    } else if(t.hasAttribute('data-gdt-abrir')){
      e.preventDefault(); abrir();
    } else if(t.hasAttribute('data-gdt-fav')){
      e.preventDefault();
      var on = favs.alternar(t.getAttribute('data-gdt-fav'));
      t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') cerrar(); });
  // otra pestaña cambió la selección
  window.addEventListener('storage', function(e){ if(e.key === 'gd.carrito') pintarCajon(); });
  pintarCajon();

  // páginas de ayuda: datos del estudio, aviso de borrador y recomendados
  var E = CFG.EMPRESA;
  document.querySelectorAll('[data-emp]').forEach(function(el){
    var v = E[el.getAttribute('data-emp')];
    el.textContent = v || 'por confirmar';
  });
  document.querySelectorAll('[data-borrador]').forEach(function(el){ el.hidden = CFG.LEGAL_VALIDADO; });
  document.querySelectorAll('[data-recomendados]').forEach(function(el){
    el.innerHTML = recomendados(parseInt(el.getAttribute('data-recomendados'), 10) || 4).map(function(k){ return card(k); }).join('');
  });
}

window.GD_TIENDA = {
  CFG:CFG, CAT:CAT, LINEAS:LINEAS, COND:COND, CRITERIOS:CRITERIOS, ESTADOS:ESTADOS, FLECHA:FLECHA,
  esc:esc, fmt:fmt, wa:wa, url:url, db:db, card:card,
  familia:familia, complementos:complementos, similares:similares, espaciosDe:espaciosDe, recomendados:recomendados,
  carrito:carrito, favs:favs, vistos:vistos, sesion:sesion, pedidos:pedidos, opiniones:opiniones,
  abrir:abrir, cerrar:cerrar
};

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();

})();
