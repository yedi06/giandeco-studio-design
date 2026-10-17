# Catálogo global

`/catalogo` reúne la oferta completa de Giandeco: productos, servicios, proyectos y espacios. Tiene buscador, filtros, orden y un estado que se comparte por URL.

## 1. Lo que se encontró (auditoría)

| Hallazgo | Consecuencia |
|----------|--------------|
| `/catalogo` era una portada editorial: tres bloques grandes (Navidad, Mueblería, Iluminación) con 4 piezas cada uno, más un escaparate «Compra el espacio» de 3 pestañas. | No había forma de ver toda la oferta, buscar ni filtrar desde un solo lugar. |
| Cada colección (`catalogo-navidad`, `-muebleria`, `-iluminacion`) tenía su propio filtro, escrito aparte. | Lógica de filtrado duplicada en tres páginas. |
| Servicios, proyectos y espacios vivían en sus propias páginas, sin conexión con el catálogo. | Un cliente que buscaba «Navidad» no encontraba la campaña para tiendas ni el proyecto Pycca. |
| Los productos solo tienen **nombre, subcategoría, precio, imagen y nota**. Stock, «novedad» y precio pueden cambiarse desde el panel. | No existen datos fiables de color, material, estilo ni medidas para filtrar (ver §6). |
| La lista de espacios estaba en `gd-tienda.js` con 5 de los 7 espacios y sin tipo ni ámbito. | Se completó ahí mismo (fuente única), sin crear otra lista. |

## 2. Decisiones de UX/UI

- **Una sola rejilla, la misma tarjeta para todos.** Foto 4/5, etiqueta del tipo sobre la foto («Servicio», «Proyecto», «Espacio») y una sola acción. Ningún tipo ocupa una fila entera: los espacios miden lo mismo que un producto. Esto se comprueba en las pruebas (§5).
- **Cada tipo conserva su acción.** Producto: precio y «Añadir a la bolsa» (la misma tarjeta y el mismo carrito de siempre). Servicio: «Ver servicio». Proyecto: «Ver proyecto». Espacio: «Ver espacio». Nada que no se venda aparece como producto.
- **Tipo y categoría son dos controles distintos.**
  - **Tipo:** pestañas «Todo · Productos · Servicios · Proyectos · Espacios», con conteos. Es de elección única, porque de él dependen los filtros específicos.
  - **Categoría (gama):** casillas Navidad · Mueblería · Iluminación, con elección múltiple. Las tres tarjetas con foto del encabezado son un atajo a este filtro.
- **Filtros que se adaptan.**
  - En «Todo» solo se ofrece Categoría.
  - Al elegir un tipo aparecen sus filtros propios (§3).
  - Un filtro sin efecto (un solo valor que ya cubre todo) no se muestra.
  - Los valores sin resultados se desactivan.
  - Al cambiar de tipo, se descartan los filtros que no aplican, para que no contaminen el resultado.
- **Escritorio (≥ 1024 px):**
  - Filtros en una barra lateral fija de 232 px, agrupados y plegables.
  - Arriba: buscador, orden y contador.
  - De 3 a 5 columnas según el ancho (1024 → 3, 1280 → 4, 1700 → 5).
- **Móvil y tablet:**
  - Una barra compacta: buscador a lo ancho y, debajo, «Filtros (n)» y «Ordenar».
  - Los filtros se abren en un **panel inferior**, con grupos plegables, «Limpiar» y «Ver N resultados».
  - Los filtros se aplican al instante; el botón solo cierra el panel y muestra cuántos resultados hay.
  - El panel atrapa el foco, se cierra con Escape y devuelve el foco al botón «Filtros».
  - Dos columnas desde 340 px; una sola por debajo.
- **Filtros activos** como chips que se quitan uno por uno, más «Limpiar todo».
- **Estados:** esqueleto mientras carga, mensaje de error con «Reintentar», y un estado vacío con salidas («Limpiar filtros», «Ver todo el catálogo»).
- **Cabecera sólida** desde el inicio: la página no tiene foto de portada, así que la cabecera transparente no se leía en tema claro. Se activa con `data-cabecera="solida"` en el `<body>`, sin afectar a las demás páginas.

## 3. Filtros

| Filtro | Se muestra en | Se lee de |
|--------|---------------|-----------|
| Categoría (gama) | todos | productos: su línea · espacios: líneas de las piezas marcadas en la escena · proyectos: `navidad` · servicios: `gamas` |
| Ámbito (Retail / Hogar) | servicios, proyectos, espacios | `linea` / `lineas` / `ambito` |
| Subcategoría | productos | `cat` de cada pieza (Jengibre, Comedor, Colgante lineal…) |
| Tipo de intervención | proyectos | `tipo` (Tiendas, Campañas, Gastronomía y hotelería…) |
| Tipo de espacio | espacios | `tipo` (Sala, Comedor, Gastronomía, Tienda) |
| Precio | productos | precio real, en tramos; «Precio a consultar» si no tiene valor |
| Disponibilidad | productos | stock del panel; **solo aparece si hay piezas agotadas** |
| Novedades | productos | piezas nuevas creadas en el panel; **solo aparece si existen** |

- **Cómo se combinan:** dentro de un filtro, los valores se suman (O); entre filtros distintos se cruzan (Y). Los conteos de cada valor se calculan con el resto de filtros aplicados.
- **Búsqueda:** por nombre, subcategoría, descripción, gama y referencia (la clave de la pieza, por ejemplo `comedor-city12`). No distingue tildes ni mayúsculas, y cada palabra debe coincidir.
- **Orden:**
  - Recomendado: productos primero, después espacios, proyectos (los destacados antes) y servicios.
  - Nombre A–Z.
  - Precio (solo con «Productos»; las piezas «a consultar» van siempre al final).
- **URL:** por ejemplo, `?tipo=producto&cat=navidad&precio=hasta-100&q=reno&orden=precio-asc`.
  - Se puede compartir y los valores inválidos se ignoran.
  - Al volver de una ficha, el catálogo conserva filtros, orden y altura de la página.

## 4. Archivos

| Archivo | Qué hace |
|---------|----------|
| `js/gd-catalogo.js` (nuevo) | Índice común, facetas, búsqueda, orden y estado ↔ URL. Sin HTML; se usa también en Node. |
| `js/gd-catalogo-ui.js` (nuevo) | Interfaz: pestañas, barra, panel de filtros, chips, rejilla, estados y altura al volver. |
| `catalogo.html` | Encabezado compacto y explorador; se mantiene el bloque SEO del `<head>`. |
| `css/gd-tienda.css` | Bloque «CATÁLOGO GLOBAL» (`.cg-*`) con los tokens existentes. |
| `js/gd-tienda.js` | `ESPACIOS` completado (7 espacios con tipo, ámbito, gamas y piezas) y expuesto como `GD_TIENDA.ESPACIOS`. |
| `js/gd-servicios.js` | Campo `gamas` en los servicios que pertenecen a una gama. |
| `js/giandeco.js` | Opción `data-cabecera="solida"`. |
| `pruebas/catalogo.test.js` (nuevo) | 18 pruebas del motor con los datos reales: `node pruebas/catalogo.test.js`. |

**Escalabilidad:**
- Una gama nueva (por ejemplo «Decoración») es una entrada en `GAMAS` más sus productos.
- Un atributo nuevo es una entrada en `FACETAS`, con los tipos a los que aplica y de dónde se lee.
- Un tipo de contenido nuevo es una entrada en `TIPOS` más su bloque en `indexar()`.

## 5. Validación

Se probó en local, en Chromium. No se probó en giandeco.com, porque no está publicado.

| Prueba | Resultado |
|--------|-----------|
| Motor con datos reales (`pruebas/catalogo.test.js`) | 18/18 |
| 12 escenarios del encargo + URL compartida, URL inválida, cambio de tipo, acceso por gama, panel móvil (foco y Escape), «Añadir a la bolsa» — escritorio 1440 y iPhone 13 | 62/62 |
| Anchos 320, 360, 390, 768, 1024, 1280, 1440 y 1920, con cuatro estados (inicio, filtros combinados, espacios, sin resultados) y el panel móvil abierto | 48 combinaciones: sin desborde, sin controles fuera de pantalla, tarjetas de igual ancho por fila, objetivos táctiles ≥ 36 px |

Columnas por ancho: 1 (320) · 2 (360–390) · 3 (768–1024) · 4 (1280–1440) · 5 (1920).

## 6. Limitaciones de los datos

- **Color, material, estilo, uso y medidas:** no existen como datos. Solo aparecen como texto libre en la nota de algunas piezas. **No se crearon esos filtros** para no inventar atributos. La búsqueda sí encuentra esas palabras cuando están en la nota (por ejemplo «MDF», «LED», «porcelana»).
- **Disponibilidad y novedades** dependen del panel de administración. Hoy todas las piezas figuran con stock y sin novedades, por eso esos filtros no se muestran. Aparecerán solos cuando haya datos.
- **Servicios:** no tienen datos de sector, objetivo ni modalidad. Solo se filtran por ámbito y gama.
- **Proyectos:** no tienen ubicación como dato, así que no se ofrece ese filtro.
- **Gama de los espacios:** se deduce de las piezas marcadas en cada escena (Mobiliario → Mueblería, Iluminación, Navidad).
- **«Compra el espacio» con tres pestañas:** el escaparate que estaba en la portada anterior del catálogo **ya no está en esta página**. La función sigue en cada página de espacio (puntos sobre la foto) y en `catalogo-compra-el-espacio`, a las que llevan las tarjetas «Espacio». Si se quiere de vuelta en `/catalogo`, puede ir debajo de la rejilla.
- **La foto de esferas navideñas** que se adjuntó como referencia **no se usó**, porque no consta que sea de Giandeco.

## 7. Pendiente (necesita información o recursos)

1. **Atributos de producto:** color, material, estilo y medidas, como datos (en el panel o en `js/giandeco.js`), para activar esos filtros.
2. **Servicios:** sector o tipo de cliente y la necesidad que resuelve cada uno.
3. **Proyectos:** ubicación y año, si se quieren como filtro.
4. **Stock real y piezas nuevas** cargados en el panel, para activar «Disponibilidad» y «Novedades».
5. **Fotos de producto en tamaños menores (responsive):** hoy cada tarjeta carga la imagen original con carga diferida (lazy).
