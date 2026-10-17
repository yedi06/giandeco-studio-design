/* ==========================================================================
   GIANDECO — PROYECTOS (fuente única)
   Alimenta los listados de Retail y Hogar, la landing de Navidad para Retail
   y las fichas individuales (proyecto-<slug>, generadas por hacer-proyectos.js).

   Para añadir un proyecto: agregue un objeto a GD_PROYECTOS y ejecute
   `node hacer-proyectos.js`. Campos:
     slug        identificador y URL: /proyecto-<slug>
     nombre, cat, sub
     lineas      ['retail'] | ['hogar'] | ambas
     tipo        clave de TIPOS (filtra los listados)
     navidad     true si es un proyecto de Navidad (sale en /retail-navidad)
     destacado   true para la home y las portadas
     galeria     [{ src, alt }] — la primera es la portada
     proceso     [{ src, alt, etapa }] opcional: boceto, plano, obra…
     reto, hice, res  textos reales del caso (una o dos frases cada uno)
     href        si el proyecto ya tiene una página propia más completa,
                 las tarjetas llevan ahí y no se genera ficha
     espacio     página de "compre el espacio" relacionada, si existe
     provisional true si el contenido aún no está confirmado por el estudio:
                 no se muestra en producción hasta que se quite
   ========================================================================== */
(function(){
'use strict';
var TIPOS = {
  tiendas:'Tiendas', campanas:'Campañas', navidad:'Navidad', gastronomia:'Gastronomía y hotelería',
  mobiliario:'Mobiliario y decoración', interiorismo:'Interiorismo', eventos:'Eventos', ferias:'Ferias de diseño'
};
var LINEAS = { retail:{ label:'Retail', href:'retail/', proyectos:'retail/proyectos' }, hogar:{ label:'Hogar', href:'hogar/', proyectos:'hogar/proyectos' } };
var P = [
 {
  "nombre": "El Corte Inglés",
  "cat": "Retail departamental",
  "reto": "Crear una experiencia de compra que se sintiera de lujo sin perder claridad de recorrido.",
  "hice": "Curé y monté los ambientes de exhibición combinando mobiliario de diseño, textiles e iluminación puntual sobre paletas neutras. Construí escenarios principales e islotes comerciales con letras corpóreas y niveles arquitectónicos que dirigieron el tráfico a las zonas de mayor conversión.",
  "res": "Mayor ticket promedio, más tráfico y más seguidores en el área infantil.",
  "sub": "Ambientes de exhibición de lujo",
  "slug": "el-corte-ingles",
  "lineas": [
   "retail"
  ],
  "tipo": "tiendas",
  "destacado": true,
  "galeria": [
   {
    "src": "images/work/corteingles.jpg",
    "alt": "Ambiente de exhibición en El Corte Inglés con sofá curvo, mesas bajas y paleta neutra"
   }
  ]
 },
 {
  "nombre": "Pycca Ecuador",
  "cat": "Campaña estacional",
  "reto": "Coordinar una campaña estacional replicable en distintas tiendas del país.",
  "hice": "Concebí y ejecuté las campañas estacionales coordinando paleta, composición e iluminación comercial de punta a punta. Monté espacios modelo para validar zonificación y puntos calientes antes de replicarlos a nivel nacional, y formé a los equipos de tienda en lineamientos visuales.",
  "res": "Más ventas, más tráfico y reconocimiento de marca a nivel nacional.",
  "sub": "Colección navideña Christmas Chalet",
  "slug": "pycca-ecuador",
  "lineas": [
   "retail"
  ],
  "tipo": "campanas",
  "navidad": true,
  "destacado": true,
  "galeria": [
   {
    "src": "images/work/pycca.jpg",
    "alt": "Colección navideña Christmas Chalet en tienda Pycca, con árbol nevado y exhibición de temporada"
   }
  ]
 },
 {
  "nombre": "Walon Punta Hermosa",
  "cat": "Tienda boutique · deporte",
  "reto": "Convertir un espacio vacío en la primera tienda boutique de la marca.",
  "hice": "Diseñé la tienda desde cero. Estructuré zonas de circulación intuitivas por categoría (training, vóley, fútbol, urban), ubiqué la caja en un punto estratégico de control visual e implementé maniquíes isla, mesas promocionales y exhibidores tipo torre en el eje principal.",
  "res": "Más tráfico en tienda y el nacimiento del primer formato boutique de la marca.",
  "sub": "La primera boutique de la marca",
  "slug": "walon-punta-hermosa",
  "lineas": [
   "retail"
  ],
  "tipo": "tiendas",
  "galeria": [
   {
    "src": "images/proyectos/walon-puntahermosa.jpg?v=2",
    "alt": "Tienda boutique Walon en Punta Hermosa"
   }
  ]
 },
 {
  "nombre": "Walon Figuritas del Barrio",
  "cat": "Campaña nacional · red de tiendas",
  "reto": "Llevar una misma campaña a tiendas de todo el país sin perder impacto local.",
  "hice": "Concebí e implementé la campaña visual nacional inspirada en la cultura del fútbol y el coleccionismo de figuritas: vitrinas con maniquíes en pleno movimiento deportivo, iluminación LED integrada, pódiums con césped sintético y estructuras tipo carta de figurita enmarcando las prendas clave.",
  "res": "Más ventas en tienda y atención inmediata del público.",
  "sub": "Fútbol y coleccionismo en vitrina",
  "slug": "walon-figuritas",
  "lineas": [
   "retail"
  ],
  "tipo": "campanas",
  "destacado": true,
  "galeria": [
   {
    "src": "images/work/walonfiguritas.jpg",
    "alt": "Vitrina de la campaña Figuritas del Barrio con maniquí en movimiento y estructura tipo carta"
   }
  ]
 },
 {
  "nombre": "Enchantée Paris",
  "cat": "Moda · vitrinismo",
  "reto": "Capturar tráfico de pasillo en un centro comercial y derivarlo a un nivel superior de tienda.",
  "hice": "Curé el styling de vitrina combinando estampados, capas y accesorios sobre maniquíes en puntos elevados de alto tráfico. Desarrollé el material gráfico promocional, incluida la tipografía en vinilo, e instalé vitrinas island display en los pasillos del centro comercial.",
  "res": "Mayor posicionamiento de marca, más ventas y más tráfico.",
  "sub": "Capturar el tráfico del pasillo",
  "slug": "enchantee-paris",
  "lineas": [
   "retail"
  ],
  "tipo": "tiendas",
  "galeria": [
   {
    "src": "images/work/enchantee.jpg",
    "alt": "Vitrina de Enchantée Paris con maniquíes y gráfica en vinilo"
   }
  ]
 },
 {
  "nombre": "Baby Club",
  "cat": "Boutique infantil",
  "reto": "Vender moda infantil sin saturar visualmente un espacio pequeño.",
  "hice": "Dirigí la experiencia visual completa equilibrando una estética neoclásica con un recorrido intuitivo. Curé utilería náutica y clásica para complementar los outfits sin saturar, agrupé por familias de color en pasteles y tierras, e integré nichos retroiluminados para resaltar texturas y calzado.",
  "res": "Mayor reconocimiento de marca, más ventas y más tráfico.",
  "sub": "Vender sin saturar",
  "slug": "baby-club",
  "lineas": [
   "retail"
  ],
  "tipo": "tiendas",
  "galeria": [
   {
    "src": "images/work/babyclub.jpg",
    "alt": "Fachada y vitrinas de la boutique infantil Baby Club Chic"
   }
  ]
 },
 {
  "nombre": "Ferrehome",
  "cat": "Bazar de decoración y ferretería",
  "reto": "Convertir un pasillo de ferretería en un bazar de decoración para el hogar sin perder identidad de marca.",
  "hice": "Distribuí el recorrido por categoría: accesorios de baño de la línea Pureza by Ferrehome sobre pared exhibidora con iluminación dirigida, menaje de cocina, cortinas y textiles, y una zona de temporada navideña. Organicé mesas de mostrador con vajilla, velas y piezas de decoración para sostener la marca dentro del punto de venta.",
  "res": "Un bazar de decoración con identidad de marca propia dentro del local.",
  "sub": "Del pasillo a la vitrina de marca",
  "slug": "ferrehome",
  "lineas": [
   "retail"
  ],
  "tipo": "tiendas",
  "galeria": [
   {
    "src": "images/proyectos/ferrehome-1.jpg",
    "alt": "Exhibición de decoración en Ferrehome"
   }
  ],
  "espacio": "catalogo/compra-espacio/bazar-ferrehome"
 },
 {
  "nombre": "Mássimo Café",
  "cat": "Gastronomía · concepto integral",
  "reto": "Diferenciar un café de barrio con identidad propia frente a la competencia.",
  "hice": "Desarrollé el concepto integral inspirado en los pubs y salones vintage europeos, fusionando maderas cálidas con acentos industriales sobre terracota, verde oliva y tonos amaderados. Planifiqué los dos niveles del local creando microambientes distintos, de la barra a las zonas de alta permanencia.",
  "res": "Mayor afluencia de clientes y referente de decoración bohemia en la zona.",
  "sub": "Esencia Bohemia",
  "slug": "massimo-cafe",
  "lineas": [
   "retail"
  ],
  "tipo": "gastronomia",
  "destacado": true,
  "proceso": [
   { "src": "images/proceso/lounge-boceto.jpg", "alt": "Boceto del lounge de Mássimo Café", "etapa": "Boceto del lounge" },
   { "src": "images/proceso/lounge-obra.jpg", "alt": "Lounge de Mássimo Café terminado, con muro de cuadros y sofá de terciopelo", "etapa": "Lounge terminado" }
  ],
  "galeria": [
   {
    "src": "images/work/massimo-mezzanine.jpg",
    "alt": "Mezzanine de Mássimo Café con muros rojos y arte enmarcado"
   },
   {
    "src": "images/work/massimo.jpg",
    "alt": "Salón de Mássimo Café con concepto Esencia Bohemia"
   }
  ],
  "espacio": "catalogo/compra-espacio/lounge-massimo"
 },
 {
  "nombre": "Hotel Unión Cusco",
  "cat": "Hotelería · restaurante",
  "reto": "Que el restaurante del hotel contara una historia de identidad local, no solo sirviera mesas.",
  "hice": "Renové integralmente el restaurante bajo el concepto Raíces, centrado en el origen, la artesanía local y la gastronomía inmersiva. Combiné lencería blanca de alta gama con textiles tradicionales y vajilla artesanal, y diseñé repisas y escaleras en madera rústica para exhibir insumos locales y licores de la casa.",
  "res": "Interés nacional e internacional. Hoy es referente frente a la competencia.",
  "sub": "Concepto Raíces",
  "slug": "hotel-union-cusco",
  "lineas": [
   "retail",
   "hogar"
  ],
  "tipo": "gastronomia",
  "galeria": [
   {
    "src": "images/work/unioncusco.jpg",
    "alt": "Restaurante del Hotel Unión Cusco con mesas vestidas y textiles tradicionales"
   },
   {
    "src": "images/espacios/hotelcusco-1.jpg",
    "alt": "Detalle de mesa en el Hotel Unión Cusco"
   },
   {
    "src": "images/espacios/hotelcusco-2.jpg",
    "alt": "Repisas de madera con insumos locales en el Hotel Unión Cusco"
   }
  ]
 },
 {
  "nombre": "Casa Grande",
  "cat": "Mobiliario y decoración",
  "reto": "Que el cliente se imaginara viviendo en los ambientes exhibidos, no solo viendo muebles.",
  "hice": "Creé ambientes inmersivos tipo vignette dentro del piso de venta, recreando dormitorios, salas y comedores completos. Apliqué paletas por zona combinando maderas nobles, terciopelos, lino y metalizados, y sumé curaduría de arte mural, plantas e iluminación de acento.",
  "res": "Más ventas, más afluencia de clientes y más movimiento en redes sociales.",
  "sub": "Ambientes que se habitan con la mirada",
  "slug": "casa-grande",
  "lineas": [
   "retail",
   "hogar"
  ],
  "tipo": "mobiliario",
  "galeria": [
   {
    "src": "images/proyectos/casagrande-1.jpg?v=2",
    "alt": "Ambiente tipo vignette en el piso de venta de Casa Grande"
   },
   {
    "src": "images/proyectos/casagrande-2.jpg",
    "alt": "Sala ambientada en Casa Grande con maderas y textiles"
   }
  ]
 },
 {
  "nombre": "Convivir con el Arte",
  "cat": "Arte · interiorismo",
  "reto": "Diseñar un espacio que no le quitara protagonismo al arte que exhibía.",
  "hice": "Conceptualizamos un espacio de inspiración ecléctica con techo en azul profundo, zócalos en verde oliva e iluminación cálida indirecta. Mobiliario de líneas orgánicas y curaduría de piezas de gran formato junto a textiles bordados e iluminación focalizada, para una atmósfera pensada para la conversación.",
  "res": "Nuevos encargos de decoración de interiores.",
  "sub": "",
  "slug": "convivir-con-el-arte",
  "lineas": [
   "hogar"
  ],
  "tipo": "interiorismo",
  "destacado": true,
  "galeria": [
   {
    "src": "images/work/convivir.jpg",
    "alt": "Sala de Convivir con el Arte con techo azul profundo y arte de gran formato"
   },
   {
    "src": "images/universos/hogar.jpg",
    "alt": "Vista general de Convivir con el Arte"
   }
  ],
  "proceso": [
   {
    "src": "images/proceso/convivir-tecnico.jpg",
    "alt": "Plano técnico de Convivir con el Arte",
    "etapa": "Plano técnico"
   },
   {
    "src": "images/proceso/convivir-color.jpg",
    "alt": "Estudio de color de Convivir con el Arte",
    "etapa": "Estudio de color"
   }
  ]
 },
 {
  "nombre": "Walon · 35 años",
  "cat": "Evento corporativo",
  "reto": "Narrar 35 años de historia de marca en una sola noche de evento.",
  "hice": "Diseñamos y ejecutamos la arquitectura efímera del aniversario: desde la experiencia de bienvenida, con arcos de acceso e integración floral, hasta la exhibición vivencial de producto con iluminación focalizada y juegos de textura. Del mobiliario a la distribución de mesas, todo pensado para guiar el flujo de invitados.",
  "res": "Fuerte repercusión en redes y cobertura de influencers.",
  "sub": "",
  "slug": "walon-35-anos",
  "lineas": [
   "hogar"
  ],
  "tipo": "eventos",
  "href": "proyectos/walon-35-anos",
  "galeria": [
   {
    "src": "images/proyectos/walon35-salon.jpg",
    "alt": "Salón del aniversario de Walon"
   }
  ]
 },
 {
  "nombre": "Casacor 2025",
  "cat": "Feria de diseño de interiores",
  "reto": "Presentar en un stand que se visita una sola vez el mismo nivel de detalle de un proyecto permanente.",
  "hice": "Diseñé un ambiente de sala completo para el recorrido de Casacor: cornisa con iluminación indirecta LED, revestimiento texturado, curaduría de cuadros con luz dirigida y una paleta de azules y verdes sobre lino. Cada rincón pensado para leerse en segundos y sostenerse de cerca en fotografía.",
  "res": "Presencia en la feria de diseño de interiores de referencia del país.",
  "sub": "",
  "slug": "casacor-2025",
  "lineas": [
   "hogar"
  ],
  "tipo": "ferias",
  "destacado": true,
  "galeria": [
   {
    "src": "images/proyectos/casacor-3.jpg",
    "alt": "Sala de Giandeco en Casacor 2025"
   },
   {
    "src": "images/espacios/casacor-1.jpg",
    "alt": "Ambiente de Casacor 2025"
   },
   {
    "src": "images/espacios/casacor-2.jpg",
    "alt": "Rincón de lectura en Casacor 2025"
   },
   {
    "src": "images/shift/casacor-detalle.jpg",
    "alt": "Detalle de material en Casacor 2025"
   }
  ],
  "proceso": [
   {
    "src": "images/proceso/casacor-boceto.jpg",
    "alt": "Boceto en acuarela de la sala de Casacor",
    "etapa": "Boceto en acuarela"
   },
   {
    "src": "images/proceso/casacor-obra.jpg",
    "alt": "La sala de Casacor terminada",
    "etapa": "Obra terminada"
   }
  ],
  "espacio": "catalogo/compra-espacio/sala-casacor"
 },
 {
  "nombre": "Expodeco 2024",
  "cat": "Feria de decoración",
  "reto": "Montar en un stand de feria la propuesta completa de Decopapel, marca de revestimientos y papel mural.",
  "hice": "Concebí el recorrido del stand por categoría: muro de exhibición de rollos y revestimientos, arco fotográfico iluminado, vegetación colgante y zona lounge con mobiliario curado — pensado para funcionar como showroom, no solo como stand de feria.",
  "res": "Presencia en la feria de decoración de referencia del país.",
  "sub": "",
  "slug": "expodeco-2024",
  "lineas": [
   "hogar"
  ],
  "tipo": "ferias",
  "href": "proyectos/expodeco-2024",
  "galeria": [
   {
    "src": "images/espacios/expodeco-1.jpg",
    "alt": "Stand de Decopapel en Expodeco 2024"
   }
  ]
 }
];
P = P.filter(function(p){ return !p.provisional; });
function url(p){ return p.href || ('proyectos/' + p.slug); }
function de(linea){ return P.filter(function(p){ return p.lineas.indexOf(linea) !== -1; }); }
/* relacionados: misma línea y mismo tipo primero, luego el resto de la línea */
function relacionados(p, n){
  var l = de(p.lineas[0]).filter(function(x){ return x.slug !== p.slug; });
  l.sort(function(a, b){ return (b.tipo === p.tipo) - (a.tipo === p.tipo) || (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0); });
  return l.slice(0, n || 3);
}
window.GD_PROYECTOS = { lista:P, TIPOS:TIPOS, LINEAS:LINEAS, url:url, de:de, relacionados:relacionados,
  get:function(s){ return P.filter(function(p){ return p.slug === s; })[0] || null; },
  navidad:function(){ return P.filter(function(p){ return p.navidad; }); } };
})();
