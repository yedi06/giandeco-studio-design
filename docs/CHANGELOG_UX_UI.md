# Changelog UX/UI

## 2026-10-20 — Retail con la propuesta D «Plano» (Navidad zona por zona)

### Cambiado
- `retail/index.html` pasa a la propuesta D del lienzo «Maqueta Navidad Retail Giandeco»: hero partido en SuperHome y Ferrehome, marcas en movimiento, **plano interactivo de 6 zonas** (elegir, agregar al montaje, pedir la propuesta por WhatsApp con las zonas y el paquete sugerido), dos casos, servicios, locales, cuatro pasos, alcance por paquete y cierre.
- Móvil propio (menos de 900 px): hero con las dos tiendas arriba, plano + pestañas + escena en una pantalla, barra de montaje fija abajo, carruseles de casos y locales, pestañas de servicios y paquetes.
- Archivos nuevos: `css/gd-retail-d.css`, `js/gd-retail-d.js`, `images/retail-navidad/` (6 zonas, 2 casos y logos claros). Las fotos de cada zona se cargan al elegirla.
- Enlaces: «Ver el servicio» lleva a cada página de servicio; los casos de Navidad a `retail/navidad` y `proyectos/ferrehome`; los locales a su ficha de proyecto.
- La versión anterior de la página queda en el historial de git (commit previo a este cambio).

## 2026-10-17 (noche) — URLs ordenadas, sin migas y espacios pegados arriba

### Cambiado
- **Orden de URL en todo el sitio.** Cada dirección dice dónde está la página: `/catalogo/compra-espacio/mesa-servida`, `/catalogo/compra-espacio/sala-estar`, `/catalogo/navidad/tren-de-jengibre`, `/retail/servicios/escaparatismo`, `/hogar/interiorismo/…`, `/proyectos/pycca-ecuador`, `/ayuda/…`, `/legal/…`. Mapa completo y cómo añadir páginas en `docs/URLS.md`; una sola fuente en `rutas.js`.
- Las 102 direcciones antiguas siguen funcionando: cada una conserva una página que lleva a la nueva (con consulta y ancla) y declara la nueva como canónica (`hacer-rutas.js`). Los carritos guardados y los enlaces compartidos no se rompen.
- `<base href="/">` en todas las páginas (con ajuste automático en el sitio de prueba) y un manejador de los enlaces `#ancla`, que con `<base>` apuntarían a la portada.
- `hacer-seo.js` y `hacer-proyectos.js` recorren carpetas; canónicas y sitemap con las rutas nuevas (101 direcciones, solo páginas reales). Nuevo `/proyectos/` con todos los proyectos.
- Siguen en la raíz sin cambio: `/cuenta`, `/checkout`, `/pagar`, `/seguimiento`, `/admin`, `/mantenimiento`, `/producto`, `/404` (los usan Supabase, Culqi y los correos).
- `previsualizar.py` imita las rutas de GitHub Pages (carpetas con `index.html`, barra final).

### Quitado
- **Migas de pan visibles** («INICIO / COMPRA EL ESPACIO / …») en las 92 páginas y en las fichas de producto, proyecto y servicio. Queda el dato estructurado `BreadcrumbList` (invisible).

### Páginas de espacio
- La foto empieza justo bajo la cabecera y, en móvil, va de borde a borde (antes: ~100 px de vacío y márgenes laterales).
- Puntos más pequeños en fotos muy anchas (Mássimo) y dos puntos reubicados para que no se solapen ni se salgan.

### Tipografía y alineación (medida en 1440 y 390 px sobre todas las páginas)
- Títulos de fichas y servicios: de 86 a 60 px en escritorio (32 px en móvil); título de Retail: de 70 a 56 px.
- Versión de recursos `20261017e`.

## 2026-10-17 — Filtros en cada colección y fotos enteras

El catálogo global (yedi06/giandeco-studio-design#11) se revirtió a pedido del cliente (yedi06/giandeco-studio-design#12). En su lugar se mejoró lo que ya existía, sin cambiar el diseño de las páginas:

- `js/gd-coleccion.js`: un solo componente para Navidad, Mueblería e Iluminación (antes, tres scripts casi iguales). Conserva los chips por categoría y las tarjetas de cada página, y suma buscador (sin tildes, por nombre, nota o referencia), precio por tramos (solo si hay más de uno), orden, contador, filtros activos que se quitan uno a uno, «Limpiar», aviso sin resultados y estado en la URL (`?cat=…&q=…&precio=…&orden=…`).
- Fotos enteras: si una foto de producto no tiene la forma de su marco (las lámparas y muebles son cuadrados; las tarjetas, 4:5), se muestra completa y el espacio sobrante se llena con la misma foto difuminada. Aplica a todas las tarjetas de producto y a la foto principal de la ficha (`encajarFoto` en `js/giandeco.js`).
- Fotos de producto enteras sobre **fondo liso del color del borde de la propia foto** (no se usa ninguna foto como relleno).
- **Ninguna foto se repite dentro de una misma página.** Las tarjetas de proyecto y servicio comprueban qué fotos ya se ven (también las que son la misma foto con otro nombre, comparadas por contenido) y, si se repetiría, muestran el **fondo de marca** `.gd-fondo`. Las portadas de Retail y Hogar eligen primero proyectos con foto propia.
- Servicios con foto propia que estaba sin uso (vitrina, detalle de arte); Mássimo Café suma boceto y obra del lounge; Ferrehome ya no repite Casacor en «otros espacios»; Walon 35, Expodeco, Espacios, Blog retail, Proyectos retail, Interiorismo, Catálogo e Iluminación sin fotos repetidas. Las pestañas del escaparate «Compra el espacio» pierden la miniatura (repetía la foto grande).
- `docs/PROPUESTA_IMAGENES.md`: qué imagen va en cada fondo, encuadre, formato y prompt para Krea; reglas (proyectos solo con fotos reales; productos nunca como relleno) y la lista de archivos duplicados con otro nombre.
- El color del borde se calcula una vez por foto (al filtrar en móvil, la rejilla tardaba hasta ~0,7 s en redibujarse).
- Versión de recursos `20261017d`.

## 2026-10-16 (tarde) — Páginas de servicio, menos texto, pie compacto

### Nuevo
- `js/gd-servicios.js`: fuente única de los servicios de Retail y Hogar (textos que ya publicaba el sitio).
- 7 páginas de servicio generadas por `hacer-proyectos.js`: `retail-escaparatismo`, `retail-remodelacion-de-locales`, `retail-visual-merchandising`, `retail-grafica-y-viniles`, `hogar-decoracion-y-ambientacion`, `hogar-mobiliario-a-medida`, `hogar-ambientacion-de-temporada`. Cada una: portada con título, el servicio en un párrafo, qué incluye, dónde lo hicimos (fichas de proyecto), enlaces útiles, cotizar por WhatsApp y los otros servicios.
- Tarjeta de servicio (foto + título): el detalle se lee al entrar.

### Cambiado
- Retail, Hogar y `retail-diseno-tiendas` (ahora «Servicios» en el menú): las tarjetas de servicio muestran solo foto y título y llevan a su página.
- `retail-diseno-tiendas`: los cuatro bloques largos pasan a las páginas de servicio; el glosario muestra el término y se despliega al tocarlo.
- `hogar-diseno-interiores`: enlaces a Decoración y a Mobiliario a medida, «Más servicios para su casa» al final y sin el hueco «FOTO PENDIENTE».
- Espacios (`hogar-espacios`, `catalogo-compra-el-espacio` y fichas de espacio): tarjetas solo con título; «en camino» como fila de nombres sin cajas punteadas; sin línea antes de los botones.
- Móvil: del hero al contenido sin hueco doble (de 104 a 76 px en Espacios).
- Pie en móvil: logo y redes en una fila, Estudio / Catálogo / Contacto / Ayuda plegados, Libro de Reclamaciones junto al copyright. De 959 a 478 px de alto (iPhone 13).
- Sitemap con 100 direcciones.

## 2026-10-16 — Arquitectura de proyectos y Navidad para retail

Publicado en giandeco.com con yedi06/giandeco-studio-design#9.

### Nuevo
- `js/gd-proyectos.js`: fuente única de los 14 proyectos (textos reales ya publicados), con tipos, líneas, destacados, Navidad, relacionados y marca `provisional` (oculta lo no confirmado).
- `js/gd-proyectos-ui.js`: tarjeta, rejilla con filtros por tipo (`aria-pressed`), migas y ficha completa; el mismo código se ejecuta en el navegador y en Node.
- `hacer-proyectos.js`: genera 12 fichas `proyecto-<slug>.html` con título, descripción, migas en JSON-LD e imagen de portada precargada. `hacer-seo.js` lo ejecuta primero y añade las fichas al sitemap (93 direcciones).
- `retail-navidad.html`: landing «Navidad para retail» — portada, cuatro piezas de campaña, proyectos de temporada (desde los datos), calendario real (reservas desde septiembre, montaje octubre–noviembre, retiro primera semana de enero) y una sola acción (cotizar por WhatsApp).
- CSS: bloque PROYECTOS (`.pj-*`) y bloque NAVIDAD PARA RETAIL (`.nr-*`) en `css/giandeco.css`, con los tokens existentes. La portada de ficha es «isla oscura» también en tema claro (`css/gd-tema.css`).
- Ampliación de fotos reutilizada en las fichas (`window.GD_AMPLIAR`).

### Cambiado
- `retail-proyectos` y `hogar-proyectos`: de bloques de texto a rejilla visual con filtros. Las anclas antiguas (`…-proyectos#slug`) redirigen a la ficha.
- `retail`: textos más cortos; tarjeta «Campañas y Navidad» → `retail-navidad`; el hueco «FOTO PENDIENTE» del método pasa a un panel tipográfico; proyectos destacados desde los datos.
- `hogar`: textos más cortos; proyectos desde los datos.
- Menú: Retail = Retail · Diseño de tiendas · Navidad · Proyectos; Hogar = Hogar · Interiorismo · Proyectos · Espacios. El Blog sale del menú, sigue en el pie y en la búsqueda.
- Pie: columna «Estudio» (Retail, Navidad para retail, Hogar, Proyectos, Quiénes somos, Blog).
- Home: la galería de trabajos enlaza a las fichas; «Navidad para tiendas» enlaza a `retail-navidad`.
- `catalogo-navidad`: el bloque de campaña enlaza a `retail-navidad`.
- `evento-walon35` y `proceso-expodeco`: el botón que volvía a la misma página ahora lleva a «Ver más proyectos».
- Versión de recursos `?v=20261016d` → `?v=20261016e`.

### Sin cambios
- Checkout (Culqi y depósito con comprobante), Mi cuenta, páginas legales, catálogo y fichas de producto (solo regeneradas por `hacer-seo.js`).

## Entregas anteriores (ya publicadas)

| PR | Contenido |
|----|-----------|
| yedi06/giandeco-studio-design#1 – #5 | Checkout con dos métodos de pago, home orientada a producto, campaña de Navidad, sistema de tarjetas, imágenes reales y reescaladas |
| yedi06/giandeco-studio-design#6 | Portada de video a pantalla completa en escritorio, tarjeta «Espacio», bloque «Compra segura» abierto |
| yedi06/giandeco-studio-design#7 | Páginas de ayuda y legales a todo el ancho; TikTok en el pie |
| yedi06/giandeco-studio-design#8 | Términos y condiciones unificados con el texto de Giandeco |
