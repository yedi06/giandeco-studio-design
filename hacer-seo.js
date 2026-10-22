/* ==========================================================================
   GIANDECO — SEO
   Se ejecuta con:  node hacer-seo.js
   Después de tocar el catálogo de js/giandeco.js o de añadir una página.

   1. Genera una página estática por pieza (producto-<clave>.html) a partir
      de producto.html: título, descripción, canónica, Open Graph y datos
      estructurados quedan escritos en el HTML, sin depender de JavaScript.
   2. Pone canónica y Open Graph en todas las páginas indexables.
   3. Escribe sitemap.xml y robots.txt.
   ========================================================================== */
'use strict';
var fs = require('fs'), path = require('path');
var RUTAS = require('./rutas.js');

require('./hacer-proyectos.js');   // primero las fichas de proyecto y de servicio, para que entren al sitemap
require('./hacer-rutas.js');       // y las redirecciones de las URL antiguas (no entran al sitemap)
var DOMINIO = 'https://giandeco.com';
var OG_POR_DEFECTO = 'images/espacios/zara-sala-1.jpg';
var NO_INDEXAR = ['producto.html', 'checkout.html', 'cuenta.html', 'seguimiento.html', '404.html', 'material-pendiente.html', 'admin.html', 'mantenimiento.html'];

/* favicon: mismo bloque que escribe aplicar-favicon.js (rutas relativas; subir FAVICON_V si cambia el favicon) */
var FAVICON_V = '1';
var FAVICON = ['<!-- favicon -->',
  '<link rel="icon" href="favicon.ico?v=' + FAVICON_V + '" sizes="32x32">',
  '<link rel="icon" href="favicon.svg?v=' + FAVICON_V + '" type="image/svg+xml">',
  '<link rel="apple-touch-icon" href="apple-touch-icon.png?v=' + FAVICON_V + '">',
  '<link rel="manifest" href="site.webmanifest?v=' + FAVICON_V + '">',
  '<!-- /favicon -->'].join('\n');

function leer(f){ return fs.readFileSync(f, 'utf8'); }
function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function abs(ruta){ return DOMINIO + '/' + ruta.replace(/\?.*$/, '').split('/').map(encodeURIComponent).join('/'); }
/* dirección pública de una página a partir de su archivo:
   catalogo/navidad/index.html -> /catalogo/navidad/ · retail/navidad.html -> /retail/navidad */
function pub(archivo){ return DOMINIO + '/' + RUTAS.rutaDe(archivo); }
/* dirección pública de una ruta de rutas.js (con o sin barra final) */
function pubRuta(ruta){ return DOMINIO + '/' + ruta; }
/* todos los .html del proyecto escritos a mano o generados (sin respaldos, docs ni dependencias) */
function recorrer(dir, out){
  fs.readdirSync(dir || '.', { withFileTypes:true }).forEach(function(e){
    var p = dir ? dir + '/' + e.name : e.name;
    if(e.isDirectory()){ if(!/^(node_modules|docs|backend|images|img|css|js|\.git|pruebas)$/.test(e.name)) recorrer(p, out); }
    else if(/\.html$/.test(e.name)) out.push(p);
  });
  return out;
}
/* misma regla que GD_URL en js/giandeco.js */
function ruta(nombre){ return nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function num(precio){ var n = parseFloat(String(precio).replace(/[^0-9.]/g, '')); return isNaN(n) ? null : n; }

/* ---- catálogo: los tres objetos de js/giandeco.js ---- */
var fuente = leer('js/giandeco.js');
function unesc(s){ return String(s).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function objeto(nombre){
  var m = fuente.match(new RegExp('var ' + nombre + ' = (\\{[\\s\\S]*?\\r?\\n\\});'));
  if(!m) throw new Error('No se encontró ' + nombre + ' en js/giandeco.js');
  return (new Function('return ' + m[1]))();
}
/* datos del estudio: la misma fuente que usa el navegador (EMPRESA en js/giandeco.js) */
var EMP = objeto('EMPRESA');
/* escribe en el HTML estático lo que el navegador pondría con JavaScript: <span data-emp="ruc">…</span> */
function llenarEmpresa(html){
  return html.replace(/(<([a-z0-9]+)\b[^>]*\bdata-emp="(\w+)"[^>]*>)([^<]*)(<\/\2>)/g, function(todo, abre, tag, k, viejo, cierra){
    var cap = /Cap$/.test(k), v = EMP[cap ? k.slice(0, -3) : k];
    if(!v) return todo;
    if(cap) v = v.charAt(0).toUpperCase() + v.slice(1);
    return abre + esc(v) + cierra;
  });
}
var LINEAS = [
  { key:'muebleria',   label:'Mueblería',   href:'catalogo/muebleria/',   datos:objeto('PRODUCTOS') },
  { key:'iluminacion', label:'Iluminación', href:'catalogo/iluminacion/', datos:objeto('ILUMINACION') },
  { key:'navidad',     label:'Navidad',     href:'catalogo/navidad/',     datos:objeto('NAVIDAD') }
];

/* ---- bloque <!-- seo --> … <!-- /seo --> dentro del <head> ---- */
function bloque(o){
  var l = ['<!-- seo -->',
    '<link rel="canonical" href="' + o.url + '">',
    '<meta property="og:type" content="' + (o.tipo || 'website') + '">',
    '<meta property="og:site_name" content="Giandeco Studio Design">',
    '<meta property="og:locale" content="es_PE">',
    '<meta property="og:title" content="' + esc(o.titulo) + '">',
    '<meta property="og:description" content="' + esc(o.desc) + '">',
    '<meta property="og:url" content="' + o.url + '">',
    '<meta property="og:image" content="' + o.img + '">',
    '<meta name="twitter:card" content="summary_large_image">'];
  (o.ld || []).forEach(function(d){ l.push('<script type="application/ld+json">' + JSON.stringify(d) + '</script>'); });
  l.push('<!-- /seo -->');
  return l.join('\n');
}
function ponerBloque(html, b){
  html = html.replace(/\r?\n?<!-- seo -->[\s\S]*?<!-- \/seo -->/, '');
  html = html.replace(/\r?\n?<!-- favicon -->[\s\S]*?<!-- \/favicon -->/, '');
  return html.replace(/(<meta name="theme-color"[^>]*>)/, function(m){ return m + '\n' + FAVICON + '\n' + b; });
}
function dato(html, re){ var m = html.match(re); return m ? m[1].trim() : ''; }

/* ---- 1. una página por pieza ---- */
var plantilla = leer('producto.html');
var productos = [];
// las páginas generadas se reconocen por data-p; se rehacen todas en cada pasada
function esGenerada(f){ return / data-p="/.test(leer(f)); }
function esRedireccion(f){ return /data-redireccion/.test(leer(f)); }
var fijas = recorrer('', []);
fijas.filter(esGenerada).forEach(function(f){ fs.unlinkSync(f); });
fijas = fijas.filter(function(f){ return fs.existsSync(f) && !esRedireccion(f); });

LINEAS.forEach(function(L){
  Object.keys(L.datos).forEach(function(k){
    var p = L.datos[k], slug = ruta(p.nombre), archivo = RUTAS.archivoDe(RUTAS.rutaProducto(L.key, slug)), url = pub(archivo), valor = num(p.precio);
    if(fijas.indexOf(archivo) !== -1 || productos.indexOf(archivo) !== -1) throw new Error('La ruta ' + archivo + ' ya existe: cambie el nombre de la pieza ' + k);
    fs.mkdirSync(path.dirname(archivo), { recursive:true });
    var titulo = p.nombre + ' — ' + L.label + ' · Giandeco Studio Design';
    // la categoría solo si aporta: «Casa de jengibre · Jengibre» repetía lo mismo
    var cat = ruta(p.nombre).indexOf(ruta(p.cat)) !== -1 ? '' : p.cat + ' · ';
    var desc = RUTAS.recortar(p.nombre + ' · ' + cat + p.precio + '. ' + p.nota + ' Envío a todo el Perú.', 155);
    var ld = { '@context':'https://schema.org', '@type':'Product', name:p.nombre, sku:k, category:p.cat, description:p.nota,
               image:[abs(p.img)], brand:{ '@type':'Brand', name:'Giandeco' } };
    if(valor !== null) ld.offers = { '@type':'Offer', priceCurrency:'PEN', price:valor.toFixed(2), url:url, seller:{ '@type':'Organization', name:'Giandeco Studio Design' } };
    var migas = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
      { '@type':'ListItem', position:1, name:'Catálogo', item:pubRuta('catalogo/') },
      { '@type':'ListItem', position:2, name:L.label, item:pubRuta(L.href) },
      { '@type':'ListItem', position:3, name:p.nombre, item:url }] };

    var html = plantilla
      .replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(titulo) + '</title>')
      .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + esc(desc) + '">')
      .replace(/\r?\n<meta name="robots" content="noindex">/, '')
      .replace('<body data-mundo="catalogo" data-seccion="producto">', '<body data-mundo="catalogo" data-seccion="producto" data-p="' + k + '">')
      // contenido legible sin JavaScript; la ficha completa lo reemplaza al cargar
      .replace('<main id="pdp"></main>', '<main id="pdp"><section class="pdp-top"><div class="gd-in">' +
        '<h1 class="gd-h1">' + esc(p.nombre) + '</h1><p class="gd-body">' + esc(p.precio) + '</p><p class="gd-body">' + esc(p.nota) + '</p>' +
        '<img src="' + p.img + '" alt="' + esc(p.nombre) + '" width="600"></div></section></main>');
    html = ponerBloque(html, bloque({ url:url, titulo:titulo, desc:desc, img:abs(p.img), tipo:'product', ld:[ld, migas] }));
    fs.writeFileSync(archivo, html);
    productos.push(archivo);
  });
});

/* ---- 2. canónica y Open Graph en el resto ---- */
var ORG = { '@context':'https://schema.org', '@type':'HomeAndConstructionBusiness', '@id':DOMINIO + '/#estudio',
  name:'Giandeco Studio Design', url:DOMINIO + '/', logo:abs('img/logo-positivo.svg'), image:abs(OG_POR_DEFECTO),
  description:'Estudio de visual merchandising, diseño de espacios comerciales e interiorismo. Diseño, producción y montaje bajo una sola dirección.',
  telephone:'+51920775559', email:'contacto@giandeco.com',
  address:{ '@type':'PostalAddress', streetAddress:'Ca. Las Bellísimas 170, Urb. Vipol', addressLocality:'Callao', postalCode:'07036', addressCountry:'PE' },
  areaServed:{ '@type':'Country', name:'Perú' },
  sameAs:['https://www.instagram.com/giandeco.studio/', 'https://www.facebook.com/profile.php?id=61593540694016', 'https://www.tiktok.com/@giandeco_studio'] };
var SITIO = { '@context':'https://schema.org', '@type':'WebSite', name:'Giandeco Studio Design', url:DOMINIO + '/', inLanguage:'es-PE' };

var paginas = [];
fijas.forEach(function(f){
  var html = leer(f);
  if(NO_INDEXAR.indexOf(f) !== -1 || /<meta name="robots" content="noindex/.test(html)) return;
  var esHome = f === 'index.html', url = esHome ? DOMINIO + '/' : pub(f);
  // descripción ≤ 155 caracteres, también en la etiqueta que ya trae la página
  var d0 = unesc(dato(html, /<meta name="description" content="([^"]*)"/)), d1 = RUTAS.recortar(d0, 155);
  if(d0 && d1 !== d0) html = html.replace(/(<meta name="description" content=")[^"]*(")/, function(t, a, b){ return a + esc(d1) + b; });
  var img = dato(html, /data-og="([^"?]+)/) || dato(html, /class="gd-kb-img" src="([^"?]+)/) || OG_POR_DEFECTO;
  html = ponerBloque(html, bloque({ url:url, titulo:dato(html, /<title>([\s\S]*?)<\/title>/), desc:d1,
                                    img:abs(img), ld: esHome ? [ORG, SITIO] : [] }));
  html = llenarEmpresa(html);
  fs.writeFileSync(f, html);
  paginas.push({ f:f, url:url, prio: esHome ? '1.0' : /^(catalogo|retail|hogar)/.test(f) ? '0.8' : /^proyectos\//.test(f) ? '0.7' : '0.5' });
});

/* ---- 3. sitemap y robots ---- */
var hoy = new Date().toISOString().slice(0, 10);
var urls = paginas.map(function(p){ return '  <url><loc>' + p.url + '</loc><lastmod>' + hoy + '</lastmod><priority>' + p.prio + '</priority></url>'; })
  .concat(productos.map(function(f){ return '  <url><loc>' + pub(f) + '</loc><lastmod>' + hoy + '</lastmod><priority>0.7</priority></url>'; }));
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n');
fs.writeFileSync('robots.txt', 'User-agent: *\nAllow: /\n' + NO_INDEXAR.map(function(f){ return 'Disallow: /' + f.replace(/\.html$/, ''); }).join('\n') + '\n\nSitemap: ' + DOMINIO + '/sitemap.xml\n');

console.log(productos.length + ' páginas de producto · ' + paginas.length + ' páginas con canónica · sitemap con ' + urls.length + ' direcciones');
