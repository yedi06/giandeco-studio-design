# Auditoría UX/UI — giandeco.com

Fecha: 2026-10-16 · Rama: `claude/vibrant-gates-sabblr` · Base: `master` 3831629 (igual a producción + CNAME).

Esta auditoría parte del sitio publicado y del repositorio. No se reinició el proyecto: todo lo hecho antes (checkout con Culqi y depósito, Mi cuenta con Supabase, home con Navidad, páginas legales) se mantiene.

## 1. Cómo se revisó

- Lectura del código: `js/giandeco.js` (mapa del sitio, header, footer, catálogo), `js/gd-tienda.js`, páginas de Retail, Hogar, listados de proyectos, páginas de evento y catálogo de Navidad.
- Recorrido con Playwright (Chromium) a 360, 390, 768, 1024, 1280 y 1440 px, en tema oscuro y claro.
- Medición antes/después con la misma herramienta (`master` servido en paralelo).

## 2. Hallazgos

| # | Hallazgo | Impacto | Estado |
|---|----------|---------|--------|
| 1 | Los proyectos no tenían página propia: los listados eran bloques largos de texto (reto / qué hice / resultado) con anclas `#slug`. La arquitectura llegaba a 3 niveles. | Sin URL que compartir ni posicionar por proyecto; listados de 9 000–12 000 px de alto. | Resuelto: 12 fichas `proyecto-<slug>` (nivel 4). |
| 2 | `retail-proyectos` tenía 1 077 palabras visibles; `hogar-proyectos`, 602. | Lectura pesada en móvil (11 868 px de alto a 390 px). | Resuelto: rejilla visual con filtros (108 y 88 palabras). |
| 3 | Los datos de proyecto estaban duplicados en cada listado (objeto `CASOS` en línea). | Cambios en dos sitios, riesgo de incoherencia. | Resuelto: fuente única `js/gd-proyectos.js`. |
| 4 | Navidad para tiendas vivía como una sección al final del catálogo de Navidad (`catalogo-navidad#campana`), mezclada con la venta de piezas. | El cliente B2B no encontraba la oferta de campaña. | Resuelto: landing `retail-navidad`. |
| 5 | Menú de Retail y de Hogar con «Blog» como sección; el footer solo listaba Retail. | Navegación más larga; Hogar sin acceso desde el pie. | Resuelto: Blog sale del menú y queda en el pie; columna «Estudio» con Retail, Navidad, Hogar, Proyectos, Quiénes somos, Blog. |
| 6 | En Retail, el paso 01 del método mostraba un hueco «FOTO PENDIENTE» con borde punteado. | Aspecto de sitio sin terminar. | Resuelto: panel tipográfico sin foto falsa. |
| 7 | Textos de Retail y Hogar largos para el rol que cumplen (portadas de línea). | Menos foco en la acción. | Reducido: Retail 394 → 262 palabras; Hogar 231 → 140. |
| 8 | La galería de trabajos de la home enlazaba a anclas de los listados. | Un clic más y sin contexto. | Resuelto: enlaza a la ficha de cada proyecto. |
| 9 | Botones «Ver el caso completo» en `evento-walon35` y `proceso-expodeco` apuntaban a un ancla del listado que volvía a la misma página. | Bucle de navegación. | Resuelto: «Ver más proyectos». |
| 10 | Casi todos los proyectos tienen una sola foto. | Las fichas no pueden mostrar proceso ni detalle. | **Pendiente de material** (ver `MATERIAL_INVENTORY.md`). |

## 3. Lo que ya estaba bien y se mantuvo

- Sistema de tokens en `css/giandeco.css` (`--bg`, `--bg-raised`, `--lino`, `--accent`, `--text-dim`, `--line`, espaciados `--sp-*`) y tema claro/oscuro en `css/gd-tema.css`.
- Header y footer generados desde un solo archivo (`js/giandeco.js`).
- Checkout con dos métodos (Culqi y depósito con comprobante), sin cambios en esta entrega.
- Páginas de producto y SEO generados con `hacer-seo.js`.

## 4. Criterios aplicados

- La imagen manda; el texto se reduce a lo que decide (qué es, para quién, qué sigue).
- Una acción principal por bloque; los enlaces secundarios van como texto con flecha, no como segundo botón.
- Sin líneas ni bordes decorativos añadidos (pedido explícito del cliente).
- Solo contenido real: textos de los casos tomados del sitio publicado; ninguna cifra, testimonio ni cliente nuevo.
