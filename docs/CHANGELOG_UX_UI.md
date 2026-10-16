# Changelog UX/UI

## 2026-10-16 — Arquitectura de proyectos y Navidad para retail

Rama `claude/vibrant-gates-sabblr`. **No publicado**: ni en la versión de prueba ni en giandeco.com (requiere autorización).

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
