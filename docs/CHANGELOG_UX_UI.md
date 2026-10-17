# Changelog UX/UI

## 2026-10-17 — Catálogo global con filtros

Detalle completo en `docs/CATALOGO.md`.

### Nuevo
- `/catalogo` pasa a ser el catálogo global: 77 elementos (47 productos, 9 servicios, 14 proyectos, 7 espacios) en una rejilla uniforme, con pestañas por tipo, accesos por gama, buscador, orden, contador, chips de filtros activos y estados de carga, error y vacío.
- Filtros que dependen del tipo (categoría, ámbito, subcategoría, tipo de intervención, tipo de espacio, precio; disponibilidad y novedades cuando hay datos). Barra lateral en escritorio y panel inferior en móvil.
- Estado en la URL; al volver de una ficha se conservan filtros y altura.
- `js/gd-catalogo.js` (motor), `js/gd-catalogo-ui.js` (interfaz) y `pruebas/catalogo.test.js` (18 pruebas).

### Cambiado
- `ESPACIOS` en `js/gd-tienda.js`: 7 espacios con tipo, ámbito, gamas y piezas (fuente única para la ficha de producto y el catálogo).
- `js/gd-servicios.js`: campo `gamas`.
- Cabecera sólida opcional (`data-cabecera="solida"`), usada en el catálogo.
- Versión de recursos `20261017a`.

## 2026-10-16 (tarde) — Páginas de servicio, menos texto, pie compacto

Publicado en giandeco.com con yedi06/giandeco-studio-design#10.

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
