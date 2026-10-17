# Propuesta de imágenes

**Regla del sitio:** una foto no se repite dentro de la misma página. Cuando se repetiría, va un **fondo de marca** (ébano, luz bronce y el monograma «G»), hasta que exista la imagen propuesta aquí.

## Reglas para crear las imágenes

1. **Proyectos:** solo fotos reales del trabajo. Una imagen generada (Krea u otra herramienta) **no puede presentarse como un proyecto ejecutado**. Si no hay foto, queda el fondo.
2. **Servicios y fondos editoriales:** se pueden generar imágenes, como ilustración del servicio. No deben mostrar marcas, logos ni clientes reales.
3. **Productos:** la foto de un producto nunca sirve de fondo ni de relleno de otra cosa.
4. **Paleta y luz** para que combinen con la web:
   - ébano `#0A0A09`, latón `#C9A24A`, bronce `#8A6F3C`, lino `#DED8CB` y humo `#F4F1EA`;
   - luz cálida de 2700 a 3000 K, sombras suaves y fotografía editorial de interiores;
   - sin personas mirando a cámara.
5. **Entrega:**
   - JPG de al menos 1600 px en el lado mayor (2400 px para las portadas a pantalla completa);
   - peso menor a 400 KB después de optimizar;
   - el nombre del archivo debe decir qué es (por ejemplo `walon35-show.jpg`).

## Fondos activos hoy (4)

| # | Dónde | Formato | Qué falta | Tipo |
|---|-------|---------|-----------|------|
| 1 | `/proyectos/walon-35-anos` · momento 03 «El show» | 16:9 | Plano general del show central: pantalla LED con la marca, pista iluminada y mesas en primer plano, desde el fondo del salón. | **Foto real** del evento |
| 2 | `/proyectos/expodeco-2024` · resultado, detalle | 4:3 | Primer plano de los paneles de revestimiento y la consola dorada del stand Decopapel. | **Foto real** del stand |
| 3 | `/proyectos/casacor-2025` · proceso, «Obra terminada» | 4:3 | La sala terminada desde **otro ángulo** que la portada: esquina opuesta, con la cornisa azul y la galería de cuadros. | **Foto real** de Casacor |
| 4 | `/retail/` · tarjeta «Remodelación de locales» | 4:5 | Imagen propia del servicio (la de hoy se repite con el paso 04 del método). | Se puede generar (ilustrativa) |

**Prompt para Krea (fondo 4):**

> Interior de una tienda en remodelación, mobiliario comercial en madera natural recién instalado, rieles de luz cálida 3000K encendidos, piso de concreto pulido, estantería vacía lista para exhibir, encuadre vertical 4:5, fotografía editorial de interiores, paleta ébano, latón y lino, sombras suaves, sin personas, sin logos ni marcas.

## Imágenes propias para cada servicio (recomendado)

Hoy las páginas de servicio usan fotos reales que también aparecen en proyectos o en espacios. No se repiten en la misma página, pero sí se ven en varias. Una imagen propia por servicio daría más variedad:

| Servicio | Formato | Prompt para Krea |
|----------|---------|------------------|
| Escaparatismo y vitrinas | 4:5 y 16:9 | Vitrina de tienda de moda vista desde la calle de noche, maniquíes con outfit de temporada, pódiums en latón, iluminación focal cálida, reflejo suave en el vidrio, paleta ébano y latón, fotografía editorial, sin logos. |
| Campañas y Navidad (retail) | 4:5 y 16:9 | Árbol navideño curado en tienda, esferas en latón y lino, mesa de exhibición de temporada, guirnalda natural, luz cálida 2700K, fondo ébano, fotografía editorial de retail, sin logos. |
| Remodelación de locales | 4:5 y 16:9 | (ver fondo 4) |
| Visual merchandising | 4:5 y 16:9 | Mesa de exhibición en tienda con productos agrupados por familia de color, torre exhibidora al fondo, luz cálida de acento, paleta lino, latón y madera, encuadre a la altura de los ojos, sin logos. |
| Gráfica y viniles | 4:5 y 16:9 | Muro de tienda con vinilo de tipografía serif dorada sobre fondo ébano, detalle de aplicación limpia, luz rasante cálida, fotografía editorial, sin marcas reales. |
| Decoración y ambientación | 4:5 y 16:9 | Sala residencial con cojines bordados, arte de gran formato y lámpara de acento encendida, mesa de centro de piedra, paleta lino, verde oliva y latón, luz 2700K, fotografía editorial de interiores. |
| Mobiliario a medida | 4:5 y 16:9 | Detalle de mueble a medida en madera de nogal con tiradores de latón, cajón abierto mostrando el ensamble, luz lateral cálida, fondo lino, fotografía de producto editorial. |
| Ambientación de temporada (hogar) | 4:5 y 16:9 | Mesa navideña servida en casa, mantelería de lino, vajilla blanca, centro de mesa con pino y velas, árbol desenfocado al fondo, luz cálida 2700K, paleta ébano, latón y lino. |

## Fotos reales que pedir al estudio

Las prioridades son los proyectos con una sola foto. Su portada se repite en listados, relacionados y servicios de otras páginas. El detalle por proyecto está en `docs/MATERIAL_INVENTORY.md`:
- El Corte Inglés
- Pycca
- Walon Punta Hermosa
- Walon Figuritas
- Enchantée Paris
- Baby Club
- Ferrehome

## Archivos duplicados con otro nombre

Estos pares son la misma foto (comparadas por contenido). El sitio ya los trata como una sola imagen (`MISMA_FOTO` en `js/gd-proyectos-ui.js`), pero conviene no volver a usarlos como si fueran distintos:

- `shift/mural.jpg` = `posicionamiento/manifiesto.jpg` = `proyectos/expodeco-montaje.jpg`
- `proyectos/casacor-3.jpg` = `proceso/casacor-obra.jpg`
- `shift/expodeco-stand.jpg` = `proceso/expodeco-obra.jpg` = `espacios/expodeco-1.jpg`
- `espacios/zara-sala-1.jpg` = `work/zarasala.jpg`
- `proyectos/walon-puntahermosa.jpg` = `universos/retail.jpg`
- `espacios/casacor-2.jpg` = `universos/hogar.jpg`
- `shift/casacor-detalle.jpg` = `cta/cta-bg.jpg`
- `shift/zonatienda.jpg` = `proceso/zonatienda-obra.jpg`
- `proyectos/expodeco-2.jpg` = `shift/expodeco-showroom.jpg`
- `espacios/zara-comedor-1.jpg` = `catalogo/mesa-servida.jpg`
- `espacios/zara-navidad-1.jpg` = `universos/catalogo.jpg`
- `espacios/zara-navidad-3.jpg` = `catalogo/navidad.jpg`
- `proceso/salon-boceto.jpg` = `02.jpg`
- `proceso/salon-obra.jpg` = `03.jpg`
- `estudio/gian.jpg` = `estudio/gian-retrato.jpg`
- `proyectos/walon35-salon.jpg` ≈ `proyectos/walon35-df.jpg` (casi idénticas)
