# Informe de validación

Fecha: 2026-10-16 · Rama `claude/vibrant-gates-sabblr` · Servidor local (`python3 previsualizar.py 8931`) · Chromium (Playwright).

Todo se probó **en local**, sobre esta rama. No se probó en la versión de prueba (GitHub Pages) ni en giandeco.com porque estos cambios no se han publicado. Los servicios en la nube (Supabase, Culqi) se interceptaron en las pruebas: ninguna llamada llegó a producción.

## Resultados

| Prueba | Alcance | Resultado |
|--------|---------|-----------|
| Desborde horizontal y errores JS | 104 páginas × 6 anchos (360, 390, 768, 1024, 1280, 1440) = 624 combinaciones | **0 problemas** |
| Enlaces e imágenes internas | DOM renderizado de las 104 páginas (enlaces, imágenes, CSS, JS) — 10 111 referencias | **0 rotas**, 0 errores JS |
| Proyectos y navegación | Filtros (con `aria-pressed`), «Todos», redirección de anclas antiguas a fichas, migas de 4 niveles, ampliación de foto (abre y cierra con Escape), CTA a WhatsApp con el nombre del proyecto, Navidad muestra Pycca, calendario, accesos a `retail-navidad`, Blog fuera del menú — escritorio 1440 y iPhone 13 | **28/28** |
| Checkout | Flujo completo con Culqi y con depósito, escritorio y móvil | **52/52** |
| Mi cuenta | Entrada, registro, Google, recuperación y cambio de clave (Supabase simulado) | **40/40** |
| Hover sin saltos de diseño | retail, hogar, retail-proyectos, hogar-espacios (111 elementos) | **0 movimientos** |
| Accesibilidad y SEO básicos | 17 páginas nuevas o rehechas: un `h1`, `alt` en todas las imágenes, enlaces y botones con nombre, sin saltos de encabezado, `lang="es"`, título, descripción y canónica | **17/17** |

## Medición antes / después

Palabras visibles (sin header ni pie) y alto de la página sin el pie, medidos con la misma herramienta sobre `master` y sobre esta rama.

| Página | Ancho | Palabras antes → ahora | Alto antes → ahora |
|--------|-------|------------------------|--------------------|
| retail | 1440 | 394 → 262 | 4 911 → 4 905 px |
| retail | 390 | 393 → 261 | 7 519 → 7 078 px |
| hogar | 1440 | 231 → 140 | 3 027 → 3 036 px |
| hogar | 390 | 230 → 139 | 3 952 → 3 447 px |
| retail-proyectos | 1440 | 1 077 → 109 | 9 119 → 4 051 px |
| retail-proyectos | 390 | 1 076 → 108 | 11 868 → 2 713 px |
| hogar-proyectos | 1440 | 602 → 89 | 5 773 → 2 717 px |
| hogar-proyectos | 390 | 601 → 88 | 7 285 → 2 007 px |

El texto de los casos no se perdió: pasó a la ficha de cada proyecto.

## Revisión visual

Capturas de página completa revisadas a 1440 px y en iPhone 13 (390 px): `retail`, `hogar`, `retail-proyectos`, `hogar-proyectos`, `retail-navidad` (tema oscuro y claro), `proyecto-casacor-2025`, `proyecto-el-corte-ingles`. Se corrigieron durante la revisión: título del cierre de `retail-navidad` con poco contraste en fondo claro, y la misma foto repetida en portada y proyecto.

## Qué no se validó

- Navegadores distintos de Chromium (Safari/iOS real, Firefox).
- Lectores de pantalla reales; solo comprobaciones automáticas de estructura.
- Rendimiento medido con Lighthouse o en red móvil real.
- La versión de prueba y giandeco.com (sin publicar).
