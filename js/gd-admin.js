/* ==========================================================================
   GIANDECO — PANEL DE ADMINISTRACIÓN
   Pedidos, productos, clientes, opiniones, reclamos, cupones y ajustes.

   Todo el acceso a datos pasa por DATOS (leer / guardar). Hoy DATOS usa el
   almacenamiento de este navegador, el mismo que la tienda, así que el panel
   ya gobierna la tienda en este equipo. Al conectar la base de datos se
   reemplaza DATOS y las pantallas no cambian.
   ========================================================================== */
(function(){
'use strict';
var T = window.GD_TIENDA, esc = T.esc, fmt = T.fmt;
var root = document.getElementById('adMain'), nav = document.getElementById('adNav');

/* --------------------------------------------------------------------------
   DATOS
   -------------------------------------------------------------------------- */
var DATOS = {
  leer: function(k, def){ var v = T.db(k); return v === null || v === undefined ? def : v; },
  guardar: function(k, v){ T.db(k, v); }
};
function pedidos(){ return DATOS.leer('pedidos', []); }
function config(){ return DATOS.leer('config', {}); }
function prod(){ var p = DATOS.leer('prod', {}); p.over = p.over || {}; p.nuevos = p.nuevos || {}; return p; }

var ESTADOS = T.ESTADOS.concat(['Cancelado']);          // índice 5 = cancelado
function fecha(iso){ return iso ? new Date(iso).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' }) : '—'; }
function totalDe(p){ return p.total != null ? p.total : (p.subtotal || 0) - (p.descuento || 0) + (p.envio || 0) + (p.armadoMonto || 0); }
function vivo(p){ return p.estado !== 5; }
function waCliente(cel, msg){ return 'https://wa.me/51' + cel + '?text=' + encodeURIComponent(msg); }
function csv(nombre, filas){
  var t = filas.map(function(f){ return f.map(function(c){ return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + t], { type:'text/csv;charset=utf-8' })); a.download = nombre; a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
}
/* 15 días hábiles desde la fecha del reclamo (lunes a viernes) */
function vence(iso){
  var d = new Date(iso), n = 0;
  while(n < 15){ d.setDate(d.getDate() + 1); if(d.getDay() !== 0 && d.getDay() !== 6) n++; }
  return d;
}
function aviso(txt){
  var a = document.getElementById('adAviso'); a.textContent = txt; a.classList.add('is-in');
  clearTimeout(aviso.t); aviso.t = setTimeout(function(){ a.classList.remove('is-in'); }, 2200);
}
function cabecera(titulo, sub, acciones){
  return '<header class="ad-head"><div><h1>' + titulo + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div><div class="ad-head-acc">' + (acciones || '') + '</div></header>';
}
function vacio(txt){ return '<div class="ad-vacio">' + txt + '</div>'; }

/* catálogo base (sin ajustes del panel) para poder mostrar también lo desactivado */
function catalogo(){
  var P = prod(), out = [];
  Object.keys(T.LINEAS).forEach(function(l){
    var src = window.GD_BASE ? window.GD_BASE[l] : {};
    Object.keys(src).forEach(function(k){
      var b = src[k], o = P.over[k] || {};
      out.push({ key:k, linea:l, nombre:b.nombre, cat:b.cat, img:b.img, base:b.precio, precio:o.precio != null ? o.precio : null, stock:o.stock, activo:o.activo !== false, nuevo:!!P.nuevos[k] });
    });
  });
  return out;
}

/* --------------------------------------------------------------------------
   PANTALLAS
   -------------------------------------------------------------------------- */
var V = {};

/* ---------- RESUMEN ---------- */
V.resumen = function(){
  var ped = pedidos(), act = ped.filter(vivo);
  var ventas = act.reduce(function(a, p){ return a + totalDe(p); }, 0);
  var cobrado = act.filter(function(p){ return p.pagado; }).reduce(function(a, p){ return a + totalDe(p); }, 0);
  var porConfirmar = act.filter(function(p){ return p.estado === 0; }).length;
  var rec = DATOS.leer('reclamos', []).filter(function(r){ return !r.respondido; });
  var ops = DATOS.leer('opiniones', []).filter(function(o){ return o.estado === 'en revisión'; }).length +
            DATOS.leer('preguntas', []).filter(function(o){ return !o.estado; }).length +
            DATOS.leer('testimonios', []).filter(function(o){ return !o.estado; }).length;

  var top = {};
  act.forEach(function(p){ p.items.forEach(function(x){ top[x.nombre] = (top[x.nombre] || 0) + x.qty; }); });
  var topL = Object.keys(top).sort(function(a, b){ return top[b] - top[a]; }).slice(0, 6), max = topL.length ? top[topL[0]] : 1;
  var porEstado = ESTADOS.map(function(e, i){ return ped.filter(function(p){ return p.estado === i; }).length; }), maxE = Math.max.apply(null, porEstado.concat([1]));

  var alertas = [];
  if(porConfirmar) alertas.push('<a href="#pedidos"><b>' + porConfirmar + '</b> pedido' + (porConfirmar > 1 ? 's' : '') + ' por confirmar al cliente</a>');
  rec.forEach(function(r){ var d = Math.ceil((vence(r.iso || new Date()) - new Date()) / 864e5); alertas.push('<a href="#reclamos" class="' + (d <= 5 ? 'es-urgente' : '') + '">Reclamo <b>' + esc(r.n) + '</b>: ' + (d < 0 ? 'plazo vencido' : 'quedan ' + d + ' días para responder') + '</a>'); });
  if(ops) alertas.push('<a href="#opiniones"><b>' + ops + '</b> opinión, pregunta o testimonio por revisar</a>');
  if(!(config().EMPRESA || {}).ruc) alertas.push('<a href="#ajustes" class="es-urgente">Falta la razón social y el RUC: sin ellos el libro de reclamaciones y los términos no son válidos</a>');

  return cabecera('Resumen', 'Lo que pasa hoy en la tienda.',
      '<button class="ad-btn" data-a="demo">' + (ped.some(function(p){ return p.demo; }) ? 'Quitar datos de demostración' : 'Cargar datos de demostración') + '</button>') +
    '<div class="ad-kpis">' +
      '<div><span>Ventas registradas</span><b>' + fmt(ventas) + '</b><i>' + act.length + ' pedidos</i></div>' +
      '<div><span>Cobrado</span><b>' + fmt(cobrado) + '</b><i>' + fmt(ventas - cobrado) + ' por cobrar</i></div>' +
      '<div><span>Ticket promedio</span><b>' + fmt(act.length ? ventas / act.length : 0) + '</b><i>por pedido</i></div>' +
      '<div><span>Clientes</span><b>' + clientes().length + '</b><i>con al menos un pedido</i></div>' +
    '</div>' +
    '<div class="ad-cols"><section class="ad-caja"><h2>Pendientes</h2>' + (alertas.length ? '<ul class="ad-alertas"><li>' + alertas.join('</li><li>') + '</li></ul>' : '<p class="ad-nota">Todo al día.</p>') + '</section>' +
      '<section class="ad-caja"><h2>Pedidos por estado</h2>' + ESTADOS.map(function(e, i){ return '<div class="ad-bar"><span>' + e + '</span><i style="--w:' + (porEstado[i] / maxE * 100) + '%"></i><b>' + porEstado[i] + '</b></div>'; }).join('') + '</section>' +
      '<section class="ad-caja"><h2>Lo más pedido</h2>' + (topL.length ? topL.map(function(n){ return '<div class="ad-bar"><span>' + esc(n) + '</span><i style="--w:' + (top[n] / max * 100) + '%"></i><b>' + top[n] + '</b></div>'; }).join('') : '<p class="ad-nota">Aún no hay pedidos.</p>') + '</section></div>';
};

/* ---------- PEDIDOS ---------- */
var filtroPed = '', abierto = null;
V.pedidos = function(){
  var ped = pedidos(), lista = ped.filter(function(p){ return filtroPed === '' || String(p.estado) === filtroPed; });
  if(abierto){ var p = ped.filter(function(x){ return x.n === abierto; })[0]; if(p) return pedidoDetalle(p); abierto = null; }
  return cabecera('Pedidos', ped.length + ' en total.', '<button class="ad-btn" data-a="csv-pedidos">Exportar CSV</button>') +
    '<div class="ad-filtros"><button class="' + (filtroPed === '' ? 'is-on' : '') + '" data-a="filtro" data-v="">Todos</button>' +
      ESTADOS.map(function(e, i){ return '<button class="' + (filtroPed === String(i) ? 'is-on' : '') + '" data-a="filtro" data-v="' + i + '">' + e + '</button>'; }).join('') + '</div>' +
    (lista.length ? '<div class="ad-tabla-w"><table class="ad-tabla"><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Entrega</th><th>Pago</th><th class="num">Total</th><th>Estado</th></tr></thead><tbody>' +
      lista.map(function(p){
        return '<tr data-a="abrir" data-v="' + esc(p.n) + '" class="es-fila"><td><b>' + esc(p.n) + '</b>' + (p.demo ? ' <em class="ad-tag">demo</em>' : '') + '</td><td>' + fecha(p.fecha) + '</td>' +
          '<td>' + esc(p.cliente.nombre) + '<small>' + esc(p.cliente.cel) + '</small></td><td>' + (p.entrega.tipo === 'recojo' ? 'Recojo' : esc(p.entrega.distrito || 'Envío')) + '</td>' +
          '<td>' + esc(p.pago || 'Cotización') + (p.pagado ? ' <em class="ad-tag es-ok">pagado</em>' : '') + '</td><td class="num">' + (p.subtotal ? fmt(totalDe(p)) : '—') + '</td>' +
          '<td><em class="ad-estado e' + p.estado + '">' + ESTADOS[p.estado] + '</em></td></tr>';
      }).join('') + '</tbody></table></div>' : vacio('No hay pedidos en este estado.'));
};
function pedidoDetalle(p){
  var num = function(v){ return v != null ? v : ''; };
  return cabecera('Pedido ' + esc(p.n), fecha(p.fecha) + ' · ' + esc(p.cliente.nombre), '<button class="ad-btn" data-a="cerrar">← Volver</button>') +
    '<div class="ad-cols es-2"><section class="ad-caja"><h2>Piezas</h2><table class="ad-tabla"><tbody>' +
      p.items.map(function(x){ return '<tr><td>' + x.qty + ' × ' + esc(x.nombre) + '<small>' + esc(x.cat || '') + '</small></td><td class="num">' + (x.valor === null ? 'A cotizar' : fmt(x.valor * x.qty)) + '</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<div class="ad-form es-3" style="margin-top:20px;">' +
        '<label>Envío (S/)<input type="number" step="0.01" min="0" id="pdEnvio" value="' + num(p.envio) + '" placeholder="por confirmar"></label>' +
        '<label>Armado (S/)<input type="number" step="0.01" min="0" id="pdArmado" value="' + num(p.armadoMonto) + '"' + (p.entrega.armado ? '' : ' placeholder="no pedido"') + '></label>' +
        '<label>Estado<select id="pdEstado">' + ESTADOS.map(function(e, i){ return '<option value="' + i + '"' + (i === p.estado ? ' selected' : '') + '>' + e + '</option>'; }).join('') + '</select></label>' +
      '</div>' +
      '<label class="ad-check"><input type="checkbox" id="pdPagado"' + (p.pagado ? ' checked' : '') + '> Pago recibido</label>' +
      '<label class="ad-form">Nota interna<textarea id="pdNota">' + esc(p.notaInterna || '') + '</textarea></label>' +
      '<p class="ad-total">Subtotal ' + fmt(p.subtotal || 0) + (p.descuento ? ' · Cupón −' + fmt(p.descuento) : '') + ' · <b>Total ' + fmt(totalDe(p)) + '</b></p>' +
      '<div class="ad-head-acc"><button class="ad-btn es-pri" data-a="guardar-pedido" data-v="' + esc(p.n) + '">Guardar cambios</button>' +
        '<a class="ad-btn" target="_blank" rel="noopener" href="' + waCliente(p.cliente.cel, 'Hola ' + p.cliente.nombre.split(' ')[0] + ', le escribe Giandeco por su pedido ' + p.n + '. ' +
          (p.envio != null ? 'Confirmamos disponibilidad. Envío: ' + fmt(p.envio) + (p.armadoMonto ? ' · Armado: ' + fmt(p.armadoMonto) : '') + '. Total: ' + fmt(totalDe(p)) + '. Medio de pago elegido: ' + (p.pago || 'por definir') + '.' : 'Estamos revisando la disponibilidad y el envío.')) + '">Escribir al cliente</a></div>' +
    '</section>' +
    '<section class="ad-caja"><h2>Cliente</h2><dl class="ad-dl">' +
      '<dt>Nombre</dt><dd>' + esc(p.cliente.nombre) + '</dd><dt>Celular</dt><dd>' + esc(p.cliente.cel) + '</dd><dt>Correo</dt><dd>' + esc(p.cliente.email) + '</dd>' +
      '<dt>Comprobante</dt><dd>' + esc(p.comprobante.resumen) + '</dd><dt>Entrega</dt><dd>' + esc(p.entrega.resumen) + '</dd>' +
      (p.entrega.recibe ? '<dt>Recibe</dt><dd>' + esc(p.entrega.recibe) + '</dd>' : '') + (p.entrega.horario ? '<dt>Horario</dt><dd>' + esc(p.entrega.horario) + '</dd>' : '') +
      '<dt>Armado</dt><dd>' + (p.entrega.armado ? 'Sí, cotizar' : 'No') + '</dd><dt>Pago</dt><dd>' + esc(p.pago || '—') + '</dd>' +
      (p.nota ? '<dt>Nota</dt><dd>' + esc(p.nota) + '</dd>' : '') + '<dt>Novedades</dt><dd>' + (p.promo ? 'Aceptó recibirlas' : 'No aceptó') + '</dd></dl></section></div>';
}

/* ---------- PRODUCTOS ---------- */
var filtroLin = '';
V.productos = function(){
  var cat = catalogo().filter(function(p){ return !filtroLin || p.linea === filtroLin; });
  return cabecera('Productos', catalogo().length + ' piezas. Los cambios se ven en la tienda al recargar.',
      '<button class="ad-btn" data-a="csv-productos">Exportar CSV</button><button class="ad-btn es-pri" data-a="nuevo-prod">Nueva pieza</button>') +
    '<div class="ad-filtros"><button class="' + (!filtroLin ? 'is-on' : '') + '" data-a="linea" data-v="">Todas</button>' +
      Object.keys(T.LINEAS).map(function(l){ return '<button class="' + (filtroLin === l ? 'is-on' : '') + '" data-a="linea" data-v="' + l + '">' + T.LINEAS[l].label + '</button>'; }).join('') + '</div>' +
    '<div id="adNuevo"></div>' +
    '<div class="ad-tabla-w"><table class="ad-tabla"><thead><tr><th></th><th>Pieza</th><th>Categoría</th><th class="num">Precio (S/)</th><th class="num">Stock</th><th>Visible</th></tr></thead><tbody>' +
      cat.map(function(p){
        var base = parseFloat(String(p.base).replace(/[^0-9.]/g, ''));
        return '<tr' + (p.activo ? '' : ' class="es-off"') + '><td><img src="' + esc(p.img) + '" alt="" loading="lazy"></td>' +
          '<td><a href="producto-' + p.key + '.html" target="_blank"><b>' + esc(p.nombre) + '</b></a><small>' + p.key + (p.nuevo ? ' · añadida desde el panel' : '') + '</small></td><td>' + esc(p.cat) + '</td>' +
          '<td class="num"><input class="ad-in" type="number" step="0.01" min="0" data-c="precio" data-k="' + p.key + '" value="' + (p.precio != null ? p.precio : (isNaN(base) ? '' : base)) + '" placeholder="consultar"></td>' +
          '<td class="num"><input class="ad-in es-corto" type="number" min="0" data-c="stock" data-k="' + p.key + '" value="' + (p.stock != null ? p.stock : '') + '" placeholder="—"></td>' +
          '<td><label class="ad-sw"><input type="checkbox" data-c="activo" data-k="' + p.key + '"' + (p.activo ? ' checked' : '') + '><i></i></label></td></tr>';
      }).join('') + '</tbody></table></div>';
};
function formNuevo(){
  return '<section class="ad-caja" style="margin-bottom:20px;"><h2>Nueva pieza</h2><form class="ad-form es-3" id="adProdForm">' +
    '<label>Nombre<input name="nombre" required></label>' +
    '<label>Línea<select name="linea">' + Object.keys(T.LINEAS).map(function(l){ return '<option value="' + l + '">' + T.LINEAS[l].label + '</option>'; }).join('') + '</select></label>' +
    '<label>Categoría<input name="cat" required placeholder="Comedor, Colgante lineal…"></label>' +
    '<label>Precio (S/)<input name="precio" type="number" step="0.01" min="0" placeholder="vacío = a consultar"></label>' +
    '<label class="es-ancho">Ruta de la foto<input name="img" required placeholder="images/mobiliario/archivo.jpg"></label>' +
    '<label class="es-todo">Descripción corta<textarea name="nota" required></textarea></label>' +
    '<div class="es-todo ad-head-acc"><button class="ad-btn es-pri" type="submit">Añadir al catálogo</button><button class="ad-btn" type="button" data-a="cancelar-nuevo">Cancelar</button></div></form></section>';
}

/* ---------- CLIENTES ---------- */
function clientes(){
  var m = {};
  pedidos().forEach(function(p){
    var k = p.cliente.email.toLowerCase(), c = m[k] || (m[k] = { nombre:p.cliente.nombre, cel:p.cliente.cel, email:p.cliente.email, n:0, total:0, ult:p.fecha, promo:false, distrito:'' });
    c.n++; if(vivo(p)) c.total += totalDe(p); if(p.fecha > c.ult) c.ult = p.fecha; if(p.promo) c.promo = true; if(p.entrega.distrito) c.distrito = p.entrega.distrito;
  });
  return Object.keys(m).map(function(k){ return m[k]; }).sort(function(a, b){ return b.total - a.total; });
}
V.clientes = function(){
  var cl = clientes();
  return cabecera('Clientes', cl.length + ' con pedidos.', '<button class="ad-btn" data-a="csv-clientes">Exportar CSV</button>') +
    (cl.length ? '<div class="ad-tabla-w"><table class="ad-tabla"><thead><tr><th>Cliente</th><th>Contacto</th><th>Distrito</th><th class="num">Pedidos</th><th class="num">Total</th><th>Último</th><th>Novedades</th><th></th></tr></thead><tbody>' +
      cl.map(function(c){
        return '<tr><td><b>' + esc(c.nombre) + '</b></td><td>' + esc(c.cel) + '<small>' + esc(c.email) + '</small></td><td>' + esc(c.distrito || '—') + '</td><td class="num">' + c.n + '</td><td class="num">' + fmt(c.total) + '</td><td>' + fecha(c.ult) + '</td>' +
          '<td>' + (c.promo ? '<em class="ad-tag es-ok">aceptó</em>' : '<em class="ad-tag">no</em>') + '</td><td><a class="ad-btn" target="_blank" rel="noopener" href="' + waCliente(c.cel, 'Hola ' + c.nombre.split(' ')[0] + ', le escribe Giandeco.') + '">WhatsApp</a></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="ad-nota">Solo se puede enviar publicidad a quienes aceptaron recibir novedades.</p>' : vacio('Los clientes aparecen con su primer pedido.'));
};

/* ---------- OPINIONES, PREGUNTAS Y TESTIMONIOS ---------- */
V.opiniones = function(){
  var cfg = config(), ops = DATOS.leer('opiniones', []), prs = DATOS.leer('preguntas', []), tss = DATOS.leer('testimonios', []);
  function bloque(titulo, lista, pinta){ return '<section class="ad-caja"><h2>' + titulo + '</h2>' + (lista.length ? lista.map(pinta).join('') : '<p class="ad-nota">Nada por revisar.</p>') + '</section>'; }
  function botones(tipo, i, estado){
    return estado ? '<em class="ad-tag ' + (estado === 'publicada' ? 'es-ok' : '') + '">' + estado + '</em>'
      : '<button class="ad-btn es-pri" data-a="moderar" data-t="' + tipo + '" data-i="' + i + '" data-v="publicada">Publicar</button><button class="ad-btn" data-a="moderar" data-t="' + tipo + '" data-i="' + i + '" data-v="rechazada">Rechazar</button>';
  }
  return cabecera('Opiniones y preguntas', 'Lo publicado aparece en la ficha de la pieza y en la página de opiniones.') +
    '<div class="ad-cols es-1">' +
    bloque('Opiniones de piezas', ops, function(o, i){
      var p = T.CAT[o.producto] || { nombre:o.producto }, est = o.estado === 'en revisión' ? '' : o.estado;
      return '<article class="ad-item"><div><b>' + esc(o.autor) + '</b> sobre ' + esc(p.nombre) + ' · pedido ' + esc(o.pedido) + ' · ' + T.opiniones.promedio(o).toFixed(1) + '/5' + (o.publicar ? '' : ' · <em class="ad-tag">no autorizó publicar</em>') +
        '<p>' + esc(o.texto) + '</p></div><div class="ad-head-acc">' + (o.publicar || est ? botones('opiniones', i, est) : '') + '</div></article>';
    }) +
    bloque('Preguntas sobre piezas', prs, function(q, i){
      var p = T.CAT[q.producto] || { nombre:q.producto };
      return '<article class="ad-item"><div><b>' + esc(p.nombre) + '</b><p>' + esc(q.p) + '</p>' +
        (q.estado ? '<p class="ad-nota">' + esc(q.r || '') + '</p>' : '<textarea class="ad-resp" data-resp="' + i + '" placeholder="Respuesta del estudio (se publica junto a la pregunta)"></textarea>') + '</div><div class="ad-head-acc">' + botones('preguntas', i, q.estado) + '</div></article>';
    }) +
    bloque('Testimonios de proyectos', tss, function(t, i){
      return '<article class="ad-item"><div><b>' + esc(t.autor) + '</b>' + (t.rol ? ' · ' + esc(t.rol) : '') + ' · ' + esc(t.proyecto) + ' · recomienda ' + t.nps + '/10' + (t.publicar ? '' : ' · <em class="ad-tag">no autorizó publicar</em>') +
        '<p><i>Necesitaba:</i> ' + esc(t.antes) + '</p><p><i>Cambió:</i> ' + esc(t.despues) + '</p></div><div class="ad-head-acc">' + (t.publicar || t.estado ? botones('testimonios', i, t.estado) : '') + '</div></article>';
    }) + '</div>' +
    '<p class="ad-nota">Publicadas ahora: ' + (cfg.OPINIONES || []).length + ' opiniones · ' + (cfg.PREGUNTAS || []).length + ' preguntas · ' + (cfg.TESTIMONIOS || []).length + ' testimonios.</p>';
};

/* ---------- RECLAMOS ---------- */
V.reclamos = function(){
  var rec = DATOS.leer('reclamos', []);
  return cabecera('Libro de reclamaciones', 'La ley da 15 días hábiles para responder por escrito cada hoja.', '<button class="ad-btn" data-a="csv-reclamos">Exportar CSV</button>') +
    (rec.length ? rec.map(function(r, i){
      var v = vence(r.iso || new Date()), d = Math.ceil((v - new Date()) / 864e5);
      return '<section class="ad-caja" style="margin-bottom:16px;"><h2>' + esc(r.n) + ' · ' + esc(r.tipo) + ' ' +
        (r.respondido ? '<em class="ad-tag es-ok">respondido ' + fecha(r.respondido) + '</em>' : '<em class="ad-tag ' + (d <= 5 ? 'es-mal' : '') + '">' + (d < 0 ? 'plazo vencido' : 'vence ' + fecha(v.toISOString()) + ' · ' + d + ' días') + '</em>') + '</h2>' +
        '<dl class="ad-dl"><dt>Consumidor</dt><dd>' + esc(r.nombre) + ' · ' + esc(r.doc) + ' · ' + esc(r.cel) + ' · ' + esc(r.email) + '</dd><dt>' + esc(r.bien) + '</dt><dd>' + esc(r.desc) + (r.pedido ? ' · pedido ' + esc(r.pedido) : '') + (r.monto ? ' · S/ ' + esc(r.monto) : '') + '</dd>' +
        '<dt>Detalle</dt><dd>' + esc(r.detalle) + '</dd><dt>Pide</dt><dd>' + esc(r.pide) + '</dd></dl>' +
        '<label class="ad-form">Respuesta del proveedor<textarea data-rec="' + i + '"' + (r.respondido ? ' readonly' : '') + '>' + esc(r.respuesta || '') + '</textarea></label>' +
        (r.respondido ? '' : '<div class="ad-head-acc"><button class="ad-btn es-pri" data-a="responder" data-i="' + i + '">Registrar respuesta</button>' +
          '<a class="ad-btn" href="mailto:' + esc(r.email) + '?subject=' + encodeURIComponent('Respuesta a su hoja de reclamación ' + r.n) + '">Abrir correo al consumidor</a></div>') + '</section>';
    }).join('') : vacio('No hay hojas de reclamación registradas en este equipo.'));
};

/* ---------- CUPONES ---------- */
V.cupones = function(){
  var c = config().CUPONES || {}, ks = Object.keys(c);
  return cabecera('Cupones', 'El campo de cupón aparece en el checkout cuando existe al menos uno.') +
    '<section class="ad-caja"><form class="ad-form es-3" id="adCupon"><label>Código<input name="codigo" required placeholder="BIENVENIDA" style="text-transform:uppercase"></label>' +
      '<label>Tipo<select name="tipo"><option value="pct">Porcentaje (%)</option><option value="monto">Monto fijo (S/)</option></select></label>' +
      '<label>Valor<input name="valor" type="number" step="0.01" min="0.01" required></label>' +
      '<div class="es-todo"><button class="ad-btn es-pri" type="submit">Crear cupón</button></div></form></section>' +
    (ks.length ? '<div class="ad-tabla-w" style="margin-top:20px;"><table class="ad-tabla"><thead><tr><th>Código</th><th>Descuento</th><th></th></tr></thead><tbody>' +
      ks.map(function(k){ return '<tr><td><b>' + esc(k) + '</b></td><td>' + (c[k].pct ? c[k].pct + ' %' : fmt(c[k].monto)) + '</td><td><button class="ad-btn" data-a="borrar-cupon" data-v="' + esc(k) + '">Eliminar</button></td></tr>'; }).join('') + '</tbody></table></div>' : '');
};

/* ---------- AJUSTES ---------- */
V.ajustes = function(){
  var c = config(), E = c.EMPRESA || {}, C = T.CFG, env = c.ENVIO || {}, pg = c.PAGO || {};
  function campo(n, l, v, ph){ return '<label>' + l + '<input name="' + n + '" value="' + esc(v == null ? '' : v) + '"' + (ph ? ' placeholder="' + ph + '"' : '') + '></label>'; }
  return cabecera('Ajustes', 'Lo que se guarda aquí lo usa la tienda: checkout, páginas legales y libro de reclamaciones.') +
    '<form id="adAjustes"><div class="ad-cols es-2">' +
    '<section class="ad-caja"><h2>Datos legales del estudio</h2><div class="ad-form es-2">' +
      campo('razon', 'Razón social', E.razon, 'como figura en SUNAT') + campo('ruc', 'RUC', E.ruc, '11 dígitos') +
      '<label class="es-todo">Domicilio fiscal<input name="dir" value="' + esc(E.dir || C.EMPRESA.dir) + '"></label>' +
      campo('correo', 'Correo', E.correo || C.EMPRESA.correo) + campo('tel', 'Teléfono', E.tel || C.EMPRESA.tel) + '</div>' +
      '<label class="ad-check"><input type="checkbox" name="validado"' + (c.LEGAL_VALIDADO ? ' checked' : '') + '> Las políticas ya fueron revisadas y aprobadas (quita el aviso «Borrador»)</label>' +
      '<label class="ad-check"><input type="checkbox" name="igv"' + (c.PRECIOS_CON_IGV === false ? '' : ' checked') + '> Los precios del catálogo incluyen IGV</label>' +
      '<div class="ad-form">' + campo('google', 'Enlace a las reseñas de Google (opcional)', c.GOOGLE_RESENAS) + '</div></section>' +
    '<section class="ad-caja"><h2>Envío</h2><div class="ad-form es-3">' +
      C.ENVIO.map(function(z){ return '<label>' + z.label + ' (S/)<input name="env-' + z.key + '" type="number" step="0.01" min="0" value="' + (env[z.key] != null ? env[z.key] : '') + '" placeholder="por confirmar"></label>'; }).join('') + '</div>' +
      '<p class="ad-nota">Vacío = el checkout muestra «por confirmar» y el costo se define en cada pedido.</p>' +
      '<label class="ad-check"><input type="checkbox" name="recojo"' + (c.RECOJO_ACTIVO === false ? '' : ' checked') + '> Ofrecer recojo en el estudio</label>' +
      '<h2 style="margin-top:28px;">Medios de pago</h2>' +
      C.PAGO.map(function(m){ return '<label class="ad-check"><input type="checkbox" name="pago-' + m.key + '"' + (pg[m.key] === false ? '' : ' checked') + '> ' + m.label + '</label>'; }).join('') + '</section></div>' +
    '<div class="ad-head-acc" style="margin-top:20px;"><button class="ad-btn es-pri" type="submit">Guardar ajustes</button></div></form>';
};

/* --------------------------------------------------------------------------
   DATOS DE DEMOSTRACIÓN  (marcados con demo:true; se quitan con un clic)
   -------------------------------------------------------------------------- */
function demo(){
  var ped = pedidos();
  if(ped.some(function(p){ return p.demo; })){ DATOS.guardar('pedidos', ped.filter(function(p){ return !p.demo; })); return; }
  var gente = [['Demo Uno', '900000001', 'demo1@ejemplo.test', 'Miraflores'], ['Demo Dos', '900000002', 'demo2@ejemplo.test', 'Santiago de Surco'], ['Demo Tres', '900000003', 'demo3@ejemplo.test', 'San Isidro'], ['Demo Cuatro', '900000004', 'demo4@ejemplo.test', 'Callao']];
  var cestas = [['comedor-city180', 'longer'], ['centro-deluxe'], ['casa-jengibre', 'farol-157', 'portavela-dorado'], ['comoda-flow', 'lara'], ['ropero-porto-blanco'], ['amaris', 'mesa-sara-canela']];
  var pagos = ['Yape', 'Tarjeta de crédito o débito', 'Transferencia o depósito bancario', 'Pago contra entrega'];
  cestas.forEach(function(c, i){
    var g = gente[i % gente.length], items = c.filter(function(k){ return T.CAT[k]; }).map(function(k){ var p = T.CAT[k]; return { id:k, key:k, nombre:p.nombre, cat:p.cat, precio:p.precio, valor:p.valor, img:p.img, qty:1 }; });
    var sub = items.reduce(function(a, x){ return a + (x.valor || 0); }, 0), d = new Date(); d.setDate(d.getDate() - i * 3);
    ped.push({ demo:true, n:'GD-DEMO-' + (1001 + i), fecha:d.toISOString(), estado:[0, 1, 2, 3, 4, 4][i], pagado:i > 1, items:items, subtotal:sub, cotizar:0, envio:i ? 45 : null,
      pago:pagos[i % pagos.length], promo:i % 2 === 0, nota:'', cliente:{ nombre:g[0], cel:g[1], email:g[2] },
      comprobante:{ tipo:'boleta', resumen:'Boleta · DNI 00000000' },
      entrega:{ tipo:'envio', distrito:g[3], armado:i === 0, resumen:'Envío a Av. Demostración 100, ' + g[3] + ', Lima' } });
  });
  DATOS.guardar('pedidos', ped);
}

/* --------------------------------------------------------------------------
   NAVEGACIÓN Y ACCIONES
   -------------------------------------------------------------------------- */
var SECC = [['resumen', 'Resumen'], ['pedidos', 'Pedidos'], ['productos', 'Productos'], ['clientes', 'Clientes'], ['opiniones', 'Opiniones y preguntas'], ['reclamos', 'Reclamos'], ['cupones', 'Cupones'], ['ajustes', 'Ajustes']];
function pintar(){
  var s = (location.hash || '#resumen').slice(1); if(!V[s]) s = 'resumen';
  var n = { pedidos: pedidos().filter(function(p){ return p.estado === 0; }).length, reclamos: DATOS.leer('reclamos', []).filter(function(r){ return !r.respondido; }).length };
  nav.innerHTML = SECC.map(function(x){ return '<a href="#' + x[0] + '"' + (x[0] === s ? ' class="is-on"' : '') + '>' + x[1] + (n[x[0]] ? '<i>' + n[x[0]] + '</i>' : '') + '</a>'; }).join('');
  root.innerHTML = V[s]();
}
window.addEventListener('hashchange', function(){ abierto = null; pintar(); window.scrollTo(0, 0); });

root.addEventListener('click', function(e){
  var b = e.target.closest('[data-a]'); if(!b) return;
  var a = b.getAttribute('data-a'), v = b.getAttribute('data-v'), i = +b.getAttribute('data-i');
  if(a === 'demo'){ demo(); pintar(); }
  else if(a === 'filtro'){ filtroPed = v; pintar(); }
  else if(a === 'linea'){ filtroLin = v; pintar(); }
  else if(a === 'abrir'){ abierto = v; pintar(); window.scrollTo(0, 0); }
  else if(a === 'cerrar'){ abierto = null; pintar(); }
  else if(a === 'guardar-pedido'){
    var ped = pedidos(), p = ped.filter(function(x){ return x.n === v; })[0], g = function(id){ var x = document.getElementById(id).value; return x === '' ? null : parseFloat(x); };
    p.envio = g('pdEnvio'); p.armadoMonto = g('pdArmado'); p.estado = +document.getElementById('pdEstado').value;
    p.pagado = document.getElementById('pdPagado').checked; p.notaInterna = document.getElementById('pdNota').value;
    DATOS.guardar('pedidos', ped); pintar(); aviso('Pedido actualizado');
  }
  else if(a === 'nuevo-prod'){ document.getElementById('adNuevo').innerHTML = formNuevo(); }
  else if(a === 'cancelar-nuevo'){ document.getElementById('adNuevo').innerHTML = ''; }
  else if(a === 'moderar'){
    var tipo = b.getAttribute('data-t'), lista = DATOS.leer(tipo, []), it = lista[i], cfg = config();
    if(tipo === 'preguntas' && v === 'publicada'){
      var r = root.querySelector('[data-resp="' + i + '"]').value.trim();
      if(!r){ aviso('Escriba la respuesta antes de publicar'); return; }
      it.r = r;
    }
    it.estado = v;
    if(v === 'publicada'){
      var K = tipo === 'opiniones' ? 'OPINIONES' : tipo === 'preguntas' ? 'PREGUNTAS' : 'TESTIMONIOS';
      cfg[K] = cfg[K] || [];
      cfg[K].push(tipo === 'opiniones' ? { producto:it.producto, autor:it.autor, lugar:it.lugar, fecha:it.fecha, notas:it.notas, texto:it.texto, ambiente:it.ambiente }
                : tipo === 'preguntas' ? { producto:it.producto, p:it.p, r:it.r, fecha:it.fecha }
                : { autor:it.autor, rol:it.rol, proyecto:it.proyecto, antes:it.antes, despues:it.despues });
      DATOS.guardar('config', cfg);
    }
    DATOS.guardar(tipo, lista); pintar(); aviso(v === 'publicada' ? 'Publicado en la tienda' : 'Rechazado');
  }
  else if(a === 'responder'){
    var rec = DATOS.leer('reclamos', []), t = root.querySelector('[data-rec="' + i + '"]').value.trim();
    if(t.length < 10){ aviso('Escriba la respuesta'); return; }
    rec[i].respuesta = t; rec[i].respondido = new Date().toISOString(); DATOS.guardar('reclamos', rec); pintar(); aviso('Respuesta registrada');
  }
  else if(a === 'borrar-cupon'){ var c = config(); delete c.CUPONES[v]; DATOS.guardar('config', c); pintar(); }
  else if(a === 'csv-pedidos'){ csv('pedidos.csv', [['Pedido', 'Fecha', 'Estado', 'Cliente', 'Celular', 'Correo', 'Comprobante', 'Entrega', 'Pago', 'Pagado', 'Subtotal', 'Envío', 'Total', 'Piezas']].concat(pedidos().map(function(p){ return [p.n, p.fecha, ESTADOS[p.estado], p.cliente.nombre, p.cliente.cel, p.cliente.email, p.comprobante.resumen, p.entrega.resumen, p.pago, p.pagado ? 'sí' : 'no', p.subtotal, p.envio, totalDe(p), p.items.map(function(x){ return x.qty + ' x ' + x.nombre; }).join(' | ')]; }))); }
  else if(a === 'csv-productos'){ csv('productos.csv', [['Clave', 'Nombre', 'Línea', 'Categoría', 'Precio base', 'Precio panel', 'Stock', 'Visible']].concat(catalogo().map(function(p){ return [p.key, p.nombre, p.linea, p.cat, p.base, p.precio, p.stock, p.activo ? 'sí' : 'no']; }))); }
  else if(a === 'csv-clientes'){ csv('clientes.csv', [['Nombre', 'Celular', 'Correo', 'Distrito', 'Pedidos', 'Total', 'Último pedido', 'Acepta novedades']].concat(clientes().map(function(c){ return [c.nombre, c.cel, c.email, c.distrito, c.n, c.total, c.ult, c.promo ? 'sí' : 'no']; }))); }
  else if(a === 'csv-reclamos'){ csv('reclamos.csv', [['Hoja', 'Fecha', 'Tipo', 'Consumidor', 'Documento', 'Correo', 'Bien', 'Detalle', 'Pedido', 'Respuesta', 'Respondido']].concat(DATOS.leer('reclamos', []).map(function(r){ return [r.n, r.fecha, r.tipo, r.nombre, r.doc, r.email, r.desc, r.detalle, r.pide, r.respuesta, r.respondido]; }))); }
});

/* edición en línea de productos */
root.addEventListener('change', function(e){
  var el = e.target, c = el.getAttribute('data-c'); if(!c) return;
  var P = prod(), k = el.getAttribute('data-k'), o = P.over[k] || (P.over[k] = {});
  if(c === 'activo') o.activo = el.checked;
  else o[c] = el.value === '' ? null : parseFloat(el.value);
  DATOS.guardar('prod', P);
  if(c === 'activo') el.closest('tr').classList.toggle('es-off', !el.checked);
  aviso('Guardado');
});

root.addEventListener('submit', function(e){
  e.preventDefault();
  var f = e.target, d = {}; Array.prototype.forEach.call(f.elements, function(x){ if(x.name) d[x.name] = x.type === 'checkbox' ? x.checked : x.value.trim(); });
  if(f.id === 'adProdForm'){
    var P = prod(), k = d.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if(!k || T.CAT[k] || P.nuevos[k]){ aviso('Ya existe una pieza con ese nombre'); return; }
    P.nuevos[k] = { linea:d.linea, nombre:d.nombre, cat:d.cat, precio:d.precio ? fmt(parseFloat(d.precio)) : 'Consultar', img:d.img, nota:d.nota };
    DATOS.guardar('prod', P); aviso('Pieza añadida. Recargue para verla.'); setTimeout(function(){ location.reload(); }, 900);
  }
  if(f.id === 'adCupon'){
    var c = config(); c.CUPONES = c.CUPONES || {};
    var o = {}; o[d.tipo] = parseFloat(d.valor); c.CUPONES[d.codigo.toUpperCase().replace(/\s+/g, '')] = o;
    DATOS.guardar('config', c); pintar(); aviso('Cupón creado');
  }
  if(f.id === 'adAjustes'){
    if(d.ruc && !/^(10|20)\d{9}$/.test(d.ruc)){ aviso('El RUC debe tener 11 dígitos y empezar en 10 o 20'); return; }
    var cf = config();
    cf.EMPRESA = { razon:d.razon, ruc:d.ruc, dir:d.dir, correo:d.correo, tel:d.tel };
    cf.LEGAL_VALIDADO = d.validado; cf.PRECIOS_CON_IGV = d.igv; cf.GOOGLE_RESENAS = d.google; cf.RECOJO_ACTIVO = d.recojo;
    cf.ENVIO = {}; T.CFG.ENVIO.forEach(function(z){ var x = d['env-' + z.key]; cf.ENVIO[z.key] = x === '' ? null : parseFloat(x); });
    cf.PAGO = {}; T.CFG.PAGO.forEach(function(m){ cf.PAGO[m.key] = d['pago-' + m.key]; });
    DATOS.guardar('config', cf); aviso('Ajustes guardados');
  }
});

pintar();
})();
