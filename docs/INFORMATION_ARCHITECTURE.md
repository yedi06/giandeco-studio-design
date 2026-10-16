# Arquitectura de información

Cuatro niveles como máximo. Las URL públicas van sin `.html` (el servidor las resuelve).

```
Nivel 1   Inicio  /
          │
Nivel 2   ├── Retail  /retail
          │   ├── Diseño de tiendas      /retail-diseno-tiendas
Nivel 3   │   ├── Navidad para retail    /retail-navidad          ← nueva
          │   │     └── proyectos de temporada → fichas (nivel 4)
          │   └── Proyectos retail       /retail-proyectos        (rejilla + filtros por tipo)
Nivel 4   │         └── Ficha            /proyecto-<slug>         ← nuevas (12)
          │
          ├── Hogar  /hogar
          │   ├── Interiorismo           /hogar-diseno-interiores
          │   ├── Proyectos hogar        /hogar-proyectos         (rejilla + filtros por tipo)
          │   │     └── Ficha            /proyecto-<slug>  ·  /evento-walon35  ·  /proceso-expodeco
          │   └── Espacios               /hogar-espacios → /espacio-<nombre>
          │
          └── Catálogo  /catalogo
              ├── Navidad                /catalogo-navidad → /<pieza>
              ├── Mueblería              /catalogo-muebleria → /<pieza>
              ├── Iluminación            /catalogo-iluminacion → /<pieza>
              └── Compra el espacio      /catalogo-compra-el-espacio

Fuera del menú principal (pie de página): Quiénes somos, Contacto, Blog (retail y hogar),
ayuda y condiciones, Libro de Reclamaciones, Mi cuenta, checkout.
```

## Menú

| Línea | Secciones (antes) | Secciones (ahora) |
|-------|-------------------|-------------------|
| Retail | Retail · Diseño de tiendas · Proyectos · Blog | Retail · Diseño de tiendas · **Navidad** · Proyectos |
| Hogar | Hogar · Diseño de interiores · Espacios · Proyectos · Blog | Hogar · **Interiorismo** · Proyectos · Espacios |
| Catálogo | sin cambios | Catálogo · Navidad · Mueblería · Iluminación · Compra el espacio |

El menú se define en `SITIO` (`js/giandeco.js`); header, menú móvil y pie lo leen de ahí.

## Proyectos: un solo origen de datos

```
js/gd-proyectos.js      datos (14 proyectos) + utilidades: de(linea), navidad(), relacionados(), url()
js/gd-proyectos-ui.js   tarjeta, rejilla con filtros, migas, ficha (sirve en navegador y en Node)
hacer-proyectos.js      escribe proyecto-<slug>.html ya renderizadas (SEO sin depender de JS)
hacer-seo.js            lo llama primero; canónica, Open Graph, sitemap (fichas con prioridad 0.7)
```

Quién consume los datos:

| Página | Qué muestra |
|--------|-------------|
| `retail` | 4 proyectos destacados de retail |
| `hogar` | 4 primeros proyectos de hogar |
| `retail-proyectos` / `hogar-proyectos` | todos los de la línea, con filtros por tipo; las anclas antiguas `#slug` redirigen a la ficha |
| `retail-navidad` | `navidad()`: con un proyecto, pieza destacada; con más, rejilla |
| `proyecto-<slug>` | portada, encargo, ficha técnica, galería con ampliación, proceso, qué hicimos, resultado, relacionados, CTA |

Proyectos con página propia más completa (`href` en los datos): `walon-35-anos` → `evento-walon35`, `expodeco-2024` → `proceso-expodeco`. Para ellos no se genera ficha.

## Ficha de proyecto (plantilla)

1. Portada a pantalla completa con migas (Inicio / Línea / Proyectos / Proyecto), categoría, nombre y subtítulo.
2. El encargo en una frase + ficha técnica (línea, tipo, temporada si es Navidad).
3. Galería (si hay más de una foto), con ampliación al tocar.
4. Proceso «Del papel a la obra» (si hay boceto, plano o render).
5. Qué hicimos + Resultado (+ enlace a «Compre las piezas de este espacio» si existe).
6. Más proyectos (3 relacionados: misma línea y tipo primero).
7. Una sola acción: WhatsApp con el nombre del proyecto en el mensaje.

## Campañas futuras

`retail-navidad` está hecha para copiarse: otra campaña (por ejemplo, Día de la Madre) necesita una página igual, un campo en los datos (como `navidad: true`) y su filtro. Si no hay proyectos marcados, la sección de proyectos se oculta sola.

## Contenido provisional

Un proyecto con `provisional: true` no aparece en listados, home ni fichas hasta que el estudio lo confirme. Hoy no hay ninguno marcado: los 14 proyectos usan textos que ya estaban publicados.
