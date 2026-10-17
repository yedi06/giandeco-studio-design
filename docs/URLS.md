# Orden de las URL

Cada dirección dice dónde está la página: **sección › subsección › página**. Una sola fuente: `rutas.js`.

## Estructura

```
/                                      inicio
├── retail/                            línea Retail
│   ├── servicios/                     hub de servicios
│   │   └── escaparatismo · remodelacion-de-locales · visual-merchandising · grafica-y-viniles
│   ├── navidad                        Navidad para retail
│   ├── proyectos                      proyectos de Retail
│   └── blog
├── hogar/                             línea Hogar
│   ├── interiorismo/                  hub de interiorismo
│   │   └── decoracion-y-ambientacion · mobiliario-a-medida · ambientacion-de-temporada
│   ├── espacios · proyectos · blog
├── proyectos/                         todos los proyectos
│   └── <proyecto>                     p. ej. /proyectos/pycca-ecuador
├── catalogo/                          catálogo
│   ├── navidad/ · muebleria/ · iluminacion/      gamas
│   │   └── <pieza>                    p. ej. /catalogo/iluminacion/lampara-led-amaris
│   ├── compra-espacio/                escaparate de espacios
│   │   └── mesa-servida · sala-estar · comedor-exterior · sala-casacor · bazar-ferrehome · lounge-massimo
│   └── decoracion · papel-mural       próximas categorías
├── ayuda/   compra-segura · envios-y-entregas · cambios-y-garantia · preguntas-frecuentes · opiniones
├── legal/   terminos-y-condiciones · politica-de-privacidad · libro-de-reclamaciones
└── contacto · quienes-somos
```

Siguen en la raíz, **sin cambio** (los usan configuraciones externas —Supabase, Culqi, los correos de pedido— o no son páginas de contenido): `/cuenta`, `/checkout`, `/pagar`, `/seguimiento`, `/admin`, `/mantenimiento`, `/producto`, `/404`.

## Cómo funciona

- **Secciones con páginas dentro** (`/retail/`, `/catalogo/`…) viven en `carpeta/index.html`. GitHub Pages las sirve con barra final: `/catalogo` redirige solo a `/catalogo/`. Las hojas (`/catalogo/compra-espacio/mesa-servida`) no llevan barra.
- **`<base href="/">`** en todas las páginas: los enlaces y recursos relativos valen a cualquier profundidad. En el sitio de prueba (`github.io/<repo>/`) un script corrige la base. Los enlaces que solo llevan `#ancla` se manejan con un pequeño script, porque con `<base>` apuntarían a la portada.
- **Redirecciones.** GitHub Pages no hace redirecciones del servidor; cada dirección antigua conserva una página mínima (`hacer-rutas.js`) que lleva a la nueva, conserva la consulta y el ancla, y declara `<link rel="canonical">` hacia la nueva para que Google las consolide. Los enlaces compartidos, los carritos guardados y el posicionamiento siguen funcionando. Si algún día se pasa a un hosting con redirecciones 301, bastaría usar este mismo mapa.
- **Canónicas y sitemap** salen de la ruta nueva (`hacer-seo.js`); el sitemap solo lista páginas reales.
- **Migas de pan:** ya no se muestran; la jerarquía está en la URL. Se conserva el dato estructurado `BreadcrumbList` (invisible) para los buscadores.

## Cómo añadir una página

1. Elija su sitio en la estructura y cree `carpeta/nombre.html` (o `carpeta/nombre/index.html` si tendrá páginas dentro). Copie el `<head>` de una página vecina, con el `<base>`.
2. Una **pieza** nueva sale sola: se añade a `js/giandeco.js` y `node hacer-seo.js` crea `/catalogo/<gama>/<nombre>`. Un **proyecto** nuevo, igual, desde `js/gd-proyectos.js`; un **servicio**, desde `js/gd-servicios.js`.
3. Si cambia la dirección de una página existente, añada la pareja a `MAPA` en `rutas.js` y ejecute `node hacer-seo.js`: crea la redirección de la antigua.

## Direcciones antiguas → nuevas

| Antes | Ahora |
|---|---|
| `/retail` | `/retail/` |
| `/retail-diseno-tiendas` | `/retail/servicios/` |
| `/retail-escaparatismo` | `/retail/servicios/escaparatismo` |
| `/retail-remodelacion-de-locales` | `/retail/servicios/remodelacion-de-locales` |
| `/retail-visual-merchandising` | `/retail/servicios/visual-merchandising` |
| `/retail-grafica-y-viniles` | `/retail/servicios/grafica-y-viniles` |
| `/retail-navidad` | `/retail/navidad` |
| `/retail-proyectos` | `/retail/proyectos` |
| `/retail-blog` | `/retail/blog` |
| `/hogar` | `/hogar/` |
| `/hogar-diseno-interiores` | `/hogar/interiorismo/` |
| `/hogar-decoracion-y-ambientacion` | `/hogar/interiorismo/decoracion-y-ambientacion` |
| `/hogar-mobiliario-a-medida` | `/hogar/interiorismo/mobiliario-a-medida` |
| `/hogar-ambientacion-de-temporada` | `/hogar/interiorismo/ambientacion-de-temporada` |
| `/hogar-espacios` | `/hogar/espacios` |
| `/hogar-proyectos` | `/hogar/proyectos` |
| `/hogar-blog` | `/hogar/blog` |
| `/catalogo` | `/catalogo/` |
| `/catalogo-navidad` | `/catalogo/navidad/` |
| `/catalogo-muebleria` | `/catalogo/muebleria/` |
| `/catalogo-iluminacion` | `/catalogo/iluminacion/` |
| `/catalogo-compra-el-espacio` | `/catalogo/compra-espacio/` |
| `/espacio-mesa-navidena` | `/catalogo/compra-espacio/mesa-servida` |
| `/espacio-sala-dorada` | `/catalogo/compra-espacio/sala-estar` |
| `/espacio-comedor-exterior` | `/catalogo/compra-espacio/comedor-exterior` |
| `/espacio-casacor` | `/catalogo/compra-espacio/sala-casacor` |
| `/espacio-ferrehome` | `/catalogo/compra-espacio/bazar-ferrehome` |
| `/espacio-massimo` | `/catalogo/compra-espacio/lounge-massimo` |
| `/proximamente-decoracion` | `/catalogo/decoracion` |
| `/proximamente-papel-mural` | `/catalogo/papel-mural` |
| `/evento-walon35` | `/proyectos/walon-35-anos` |
| `/proceso-expodeco` | `/proyectos/expodeco-2024` |
| `/compra-segura` | `/ayuda/compra-segura` |
| `/envios-y-entregas` | `/ayuda/envios-y-entregas` |
| `/cambios-y-garantia` | `/ayuda/cambios-y-garantia` |
| `/preguntas-frecuentes` | `/ayuda/preguntas-frecuentes` |
| `/opiniones` | `/ayuda/opiniones` |
| `/terminos-y-condiciones` | `/legal/terminos-y-condiciones` |
| `/politica-de-privacidad` | `/legal/politica-de-privacidad` |
| `/libro-de-reclamaciones` | `/legal/libro-de-reclamaciones` |
| `/proximamente-iluminacion` | `/catalogo/iluminacion/` |
| `/proyecto-<nombre>` | `/proyectos/<nombre>` |
| `/<nombre-de-la-pieza>` | `/catalogo/<gama>/<nombre-de-la-pieza>` |

<details><summary>Las 47 piezas</summary>

| Antes | Ahora |
|---|---|
| `/centro-deluxe-nature` | `/catalogo/muebleria/centro-deluxe-nature` |
| `/centro-burnie-cinamono` | `/catalogo/muebleria/centro-burnie-cinamono` |
| `/comoda-flow-1-37` | `/catalogo/muebleria/comoda-flow-1-37` |
| `/comedor-1-2-city-boucle` | `/catalogo/muebleria/comedor-1-2-city-boucle` |
| `/comedor-1-80-city-boucle` | `/catalogo/muebleria/comedor-1-80-city-boucle` |
| `/comedor-1-6-living-vidrio` | `/catalogo/muebleria/comedor-1-6-living-vidrio` |
| `/mesa-sara-1-2-canela` | `/catalogo/muebleria/mesa-sara-1-2-canela` |
| `/mesa-sara-1-2-vidrio` | `/catalogo/muebleria/mesa-sara-1-2-vidrio` |
| `/ropero-bilbao-crema` | `/catalogo/muebleria/ropero-bilbao-crema` |
| `/ropero-bilbao-rouble` | `/catalogo/muebleria/ropero-bilbao-rouble` |
| `/ropero-porto-blanco` | `/catalogo/muebleria/ropero-porto-blanco` |
| `/ropero-porto-rouble` | `/catalogo/muebleria/ropero-porto-rouble` |
| `/lampara-led-amaris` | `/catalogo/iluminacion/lampara-led-amaris` |
| `/lampara-basilea` | `/catalogo/iluminacion/lampara-basilea` |
| `/lampara-bristol` | `/catalogo/iluminacion/lampara-bristol` |
| `/lampara-lara-black` | `/catalogo/iluminacion/lampara-lara-black` |
| `/lampara-longer` | `/catalogo/iluminacion/lampara-longer` |
| `/lampara-mady-white` | `/catalogo/iluminacion/lampara-mady-white` |
| `/lampara-stratto` | `/catalogo/iluminacion/lampara-stratto` |
| `/lampara-villa` | `/catalogo/iluminacion/lampara-villa` |
| `/lampara-spazio` | `/catalogo/iluminacion/lampara-spazio` |
| `/tren-de-jengibre` | `/catalogo/navidad/tren-de-jengibre` |
| `/casa-de-jengibre` | `/catalogo/navidad/casa-de-jengibre` |
| `/cascanueces-musicales` | `/catalogo/navidad/cascanueces-musicales` |
| `/cascanueces-mecedores` | `/catalogo/navidad/cascanueces-mecedores` |
| `/munecos-perritos-cascanueces` | `/catalogo/navidad/munecos-perritos-cascanueces` |
| `/adorno-reno-navideno-recostado` | `/catalogo/navidad/adorno-reno-navideno-recostado` |
| `/adorno-reno-navideno-de-pie` | `/catalogo/navidad/adorno-reno-navideno-de-pie` |
| `/adorno-reno-recostado-con-plato` | `/catalogo/navidad/adorno-reno-recostado-con-plato` |
| `/adorno-reno-de-pie-con-plato` | `/catalogo/navidad/adorno-reno-de-pie-con-plato` |
| `/papa-noel` | `/catalogo/navidad/papa-noel` |
| `/bombonera-navidena-caja-de-regalo` | `/catalogo/navidad/bombonera-navidena-caja-de-regalo` |
| `/bombonera-navidena-casita` | `/catalogo/navidad/bombonera-navidena-casita` |
| `/portavela-dorado` | `/catalogo/navidad/portavela-dorado` |
| `/portavela-negro` | `/catalogo/navidad/portavela-negro` |
| `/venado-transparente-mediano` | `/catalogo/navidad/venado-transparente-mediano` |
| `/venado-transparente-pequeno` | `/catalogo/navidad/venado-transparente-pequeno` |
| `/adorno-casa-musical` | `/catalogo/navidad/adorno-casa-musical` |
| `/taza-cascanuez-roja` | `/catalogo/navidad/taza-cascanuez-roja` |
| `/taza-cascanuez` | `/catalogo/navidad/taza-cascanuez` |
| `/arbol-navideno-iluminado` | `/catalogo/navidad/arbol-navideno-iluminado` |
| `/casa-navidena-iluminada-mediana` | `/catalogo/navidad/casa-navidena-iluminada-mediana` |
| `/muneco-de-nieve-iluminado` | `/catalogo/navidad/muneco-de-nieve-iluminado` |
| `/casa-navidena-iluminada-pequena` | `/catalogo/navidad/casa-navidena-iluminada-pequena` |
| `/arreglo-pino-y-berries` | `/catalogo/navidad/arreglo-pino-y-berries` |
| `/farol-1-24-m` | `/catalogo/navidad/farol-1-24-m` |
| `/farol-1-57-m` | `/catalogo/navidad/farol-1-57-m` |

</details>

Las fichas de proyecto: `/proyecto-<nombre>` pasa a `/proyectos/<nombre>` para los 12 proyectos con ficha.

## Qué revisar al publicar

- Que `https://giandeco.com/catalogo/compra-espacio/mesa-servida` y una dirección antigua (`/espacio-mesa-navidena`) abran bien.
- En **Google Search Console**, enviar el nuevo `sitemap.xml`.
- Si Culqi, Supabase o algún correo apuntan a páginas movidas (términos, libro de reclamaciones…), siguen funcionando por la redirección, pero conviene actualizar el enlace.
