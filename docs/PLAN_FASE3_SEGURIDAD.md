# Plan de la Fase 3 — seguridad y pagos (solo propuestas, nada implementado)

Fecha: 2026-10-20. Se espera tu OK punto por punto. Esfuerzo: S ≤ 0,5 día · M 1–2 días · L 3–5 días.

## A. Stock manipulable

**Hoy.** Cualquiera con la clave pública puede insertar filas en `pedidos`. El trigger `descontar_stock` resta las unidades **al crear** el pedido (no al pagarlo), no caduca, y sin dato de stock el valor por defecto es 1. Consecuencias: (1) un visitante puede dejar en 0 el stock de cualquier pieza con pedidos falsos; (2) un pedido abandonado retiene el stock para siempre; (3) las claves de `items` las inventa el cliente (el trigger no comprueba que existan); (4) el número de pedido lo genera el navegador (`GD-AAMMDD-NNNN`, 9 000 posibles al día): una colisión hace fallar el `insert` y el pedido queda solo en el dispositivo del cliente sin que nadie lo note.

**Diseño propuesto.**
1. **Crear pedido por función de servidor** (`rpc/crear_pedido`, SQL `security definer`, o Edge Function): valida que cada `key` exista en la tabla de catálogo (ver E), cantidad 1–`max` (p. ej. 20), máximo de líneas, tamaño, formato de celular/correo; **genera el número en el servidor** (secuencia, sin colisiones) y devuelve el número. Se **revoca el `insert` directo de `anon` sobre `pedidos`** (se quita la política «la tienda registra» para esa tabla).
2. **Límite de uso**: máximo N pedidos por IP y por celular por hora (tabla `intentos`, ver B).
3. **Reserva con vencimiento**: tabla `reservas(pedido, clave, qty, vence)`. Al crear el pedido se reserva (p. ej. 2 h para pago en línea, 24 h para depósito). El stock disponible = stock − reservas vigentes. Ya no se toca `config.prod.over.*.stock` al crear.
4. **Liberación**: tarea programada (`pg_cron`, cada 15 min) que borra reservas vencidas de pedidos no pagados y marca el pedido «vencido».
5. **Descuento firme al pagar**: `marcar_pagado` (ya existe, solo `service_role`) convierte la reserva en descuento real; en pago directo lo hace el panel al marcar «Pago recibido».
6. **Verificación al cobrar**: `cuenta()` en la función de pago comprueba que la reserva sigue vigente (o que hay stock) antes de llamar a Culqi.

**Migración sin romper pedidos existentes.** Fase 1: crear tablas y función en paralelo, sin quitar nada. Fase 2: el front usa `crear_pedido` con respaldo al `insert` antiguo (si la función falla). Fase 3: tras una semana sin uso del camino antiguo, se revoca el `insert` directo. Los pedidos existentes no se tocan (ya descontaron stock); se marca un `config.migracion_stock` para no descontar dos veces. Ajuste del trigger `descontar_stock`: pasa a no hacer nada cuando el pedido trae `reserva = true`.

**Riesgos.** Es el cambio más grande: toca checkout, SQL y panel. Si `crear_pedido` falla, la tienda no registra pedidos (por eso el respaldo temporal). Hay que decidir (negocio): duración de la reserva, stock por defecto de piezas sin dato (hoy 1), y qué pasa con piezas «a cotizar».
**Esfuerzo: L. Riesgo: medio-alto.**

## B. Límite de intentos en `consulta`, `cobrar` y `estado_pedido`

**Hoy.** `cobrar` limita 8 rechazos por pedido; `consulta` y `estado_pedido` no limitan nada. Para acertar un pedido hay que acertar número (≤ 9 000/día) **y** celular (9 dígitos que empiezan por 9); la respuesta de `consulta` devuelve nombre de pila, correo, piezas y montos.

**¿Necesita el front el correo?** Sí, hoy: `js/gd-pago.js:116` lo pasa a `CulqiCheckout` como `client.email`, y la verificación 3-D Secure usa `r.email` de la respuesta de `cobrar` (`gd-pago.js:65`). **El servidor no depende de él** para cobrar (usa el correo guardado en el pedido).

**Propuesta.**
1. Tabla `intentos(clave text, ventana timestamptz, n int)` + función `permitir(clave, límite, ventana)` en SQL. Clave = IP (cabecera `x-forwarded-for`, que PostgREST expone en `request.headers`) y, aparte, el número de pedido.
2. `estado_pedido` (RPC): llamar a `permitir` dentro de la función (p. ej. 20 por IP/10 min y 5 fallos por pedido/hora) y responder igual (`null`) cuando se excede. Mantiene la función pública a propósito.
3. Función `pago`: misma lógica al inicio de `consulta` y `cobrar` (la tabla se escribe con la clave de servicio). Respuesta uniforme `no-encontrado` para «pedido inexistente», «celular incorrecto» y «límite alcanzado» (no revelar cuál).
4. **Correo**: `consulta` devuelve solo el correo **enmascarado** (`pr***@giandeco.com`) para mostrarlo. Para `CulqiCheckout` el front toma el correo de su propio pedido local (el cliente que acaba de comprar lo tiene en `localStorage`); si abre el enlace en otro dispositivo, se le pide que escriba el correo del pedido (solo sirve para el formulario: el cargo usa el del servidor). Para 3-D Secure se usa ese mismo correo.
5. Opcional más adelante: Cloudflare Turnstile en la página `pagar`.

**Riesgos.** IP compartida (oficina, red móvil con CGNAT) puede bloquear a un cliente legítimo: límites generosos y mensaje que remite a WhatsApp. Hay que verificar que Supabase pase `x-forwarded-for` en Edge Functions (sí) y en PostgREST (sí).
**Esfuerzo: M. Riesgo: bajo-medio.**

## C. Libro de reclamaciones: copia por correo y antispam

**Hoy.** **No hay envío automático.** La página promete «recibirla en su correo» pero solo ofrece un botón `mailto:` que abre el correo del propio consumidor con la hoja pegada (`legal/libro-de-reclamaciones.html`, línea del botón «mailto»). Si el consumidor no lo envía, el estudio solo ve la fila en la tabla `reclamos` del panel. `registrar_reclamo` es pública, sin límite y consume un correlativo por llamada (un script puede quemar correlativos o llenar la tabla; el tope de 20 000 bytes por hoja no frena el volumen).

**Propuesta más simple y robusta.**
1. **Edge Function `reclamo-copia`** invocada por un *Database Webhook* sobre `insert` en `reclamos`: arma el PDF/HTML de la hoja y envía **(a)** copia al correo del consumidor y **(b)** aviso al estudio (`contacto@giandeco.com`), con un proveedor transaccional (Resend o Brevo; clave como secreto de la función, nunca en el repo). Requiere SPF/DKIM del dominio giandeco.com. Así el envío ocurre aunque el consumidor cierre la página y queda registrado (columna `copia_enviada`).
2. Cambiar el texto de la página a lo que realmente pasa (hasta entonces: «Puede guardar o imprimir su copia»).
3. **Antispam**: (a) *honeypot* + tiempo mínimo en el formulario; (b) `permitir()` (ver B) dentro de `registrar_reclamo` por IP y por correo; (c) validar formato y longitud de cada campo en SQL; (d) opcional: Cloudflare Turnstile verificado en una Edge Function que sustituya a la RPC pública (entonces sí se revocaría `anon`, decisión que dejo a tu criterio porque hoy la función es pública a propósito).
4. Plazo legal: la fecha de registro ya la fija la base de datos; el aviso al estudio debe incluir el vencimiento (15 días hábiles).

**Riesgos.** Depende de contratar/configurar el proveedor de correo y el DNS. Si el correo falla, el reclamo **sigue registrado** (el envío es posterior).
**Esfuerzo: M. Riesgo: bajo.**

## D. Culqi: webhook, reembolsos y PagoEfectivo

**Hoy.** La función solo crea cargos (`/v2/charges`) con token de tarjeta o Yape. Si la respuesta se pierde queda `incierto` y requiere revisión manual; no hay conciliación ni reembolsos desde el panel; no hay efectivo.

**Propuesta.**
1. **Webhook de conciliación** (`pago-webhook`, Edge Function sin JWT): recibe `charge.creation.succeeded`, `charge.creation.failed`, `order.status.changed`, `refund.creation.succeeded`. **No se confía en el cuerpo**: con el id del evento se **vuelve a consultar** el cargo/orden a la API de Culqi con la clave privada y se actúa sobre esa respuesta. Resuelve los `incierto`: busca el cargo por `metadata.pedido` y llama a `marcar_pagado`. Idempotente por `cargo`.
2. **Reembolsos**: acción `reembolsar` en la función, solo para admins (verifica el JWT de Supabase + `es_admin`), que llama a `/v2/refunds`, guarda en `pagos` y marca el pedido. Botón en el panel.
3. **PagoEfectivo**: crear **órdenes** (`/v2/orders`) en lugar de cargos; devolver el CIP al cliente; el webhook `order.status.changed` (paid) llama a `marcar_pagado`. Hace falta una expiración de orden alineada con la reserva de stock (A).
4. Registrar la URL del webhook en el panel de Culqi y probar primero con claves `pk_test/sk_test`.

**Riesgos.** Es dinero: todo se prueba en modo prueba y con el monto recalculado en servidor (no tocar `cuenta()`). Alcance de Culqi/PagoEfectivo según el contrato que cierres (hoy estás negociando también con otras pasarelas: conviene esperar a decidir pasarela antes de invertir aquí).
**Esfuerzo: L. Riesgo: medio.**

## E. Precios fuera de una expresión regular

**Hoy.** `precios()` en `backend/functions/pago/index.ts` descarga `js/giandeco.js` desde giandeco.com y extrae `clave`, `nombre`, `cat`, `precio` con una regex (cache 5 min). Si cambia el orden de campos, se renombra una clave o el sitio no responde, el cobro se detiene (o se cobra con una lista incompleta).

**Propuesta.** Tabla `catalogo(clave text primary key, linea text, nombre text, precio numeric null, activo bool default true)` en Supabase.
1. **Fuente de verdad provisoria**: `hacer-seo.js` ya lee `js/giandeco.js` con `objeto()`; que además escriba `backend/catalogo.sql` (upserts) o `catalogo.json`, que subes al SQL Editor al cambiar precios. El catálogo del front no cambia.
2. La función lee la tabla (`catalogo?select=clave,precio,activo`) y **solo si falla** usa la regex actual (respaldo por 1–2 versiones). Los ajustes del panel (`config.prod.over/nuevos`) siguen aplicándose encima, igual que hoy.
3. Más adelante, si quieres, el panel edita la tabla y el front la lee (eso sí cambia el catálogo; fuera de alcance ahora).
4. Prueba automática en `hacer-seo.js`: abortar si `giandeco.js` tiene una pieza sin precio parseable o con clave duplicada.

**Riesgos.** Dos fuentes que pueden divergir hasta que haya una sola: por eso el paso 1 es generado, no manual.
**Esfuerzo: M. Riesgo: bajo.**

## F. Repositorio público

**Qué se expone hoy** (en `giandeco-web`, que recibe el mismo contenido que `master`):
- **Backend y esquema**: `backend/schema.sql`, `pagos.sql`, `reclamos.sql`, `functions/pago/index.ts`, y la nueva carpeta `backend/migraciones/`. Revelan nombres de tablas, políticas RLS, reglas de validación, límites (8 intentos, montos mínimo/máximo), orígenes CORS y la proyección de seguridad. La **región** (São Paulo) sale de `schema.sql` y de la política de privacidad; el **ID del proyecto Supabase** y la clave pública `sb_publishable_…` van en `js/gd-tienda.js` (inevitable: el navegador las necesita; la seguridad real está en RLS, no en ocultarlas).
- **Panel de administración**: `admin.html` + `js/gd-admin.js` (código completo del panel, flujo de acceso por enlace mágico y nombre de la tabla `admins`). Con la clave pública cualquiera puede intentar *login*; lo que lo impide es RLS y `es_admin()`, que hay que mantener bien (de ahí la migración de la Fase 2).
- **Documentación y herramientas**: `docs/*` (auditorías, inventario de material), `hacer-*.js`, `rutas.js`, `previsualizar.py`, `publicar-produccion.sh` (nombres de repos y ramas), `package-lock.json`.
- **Historial git**: mensajes de commit con descripciones internas y enlaces de sesión. **No hallé secretos** en el árbol ni en el historial.
- Datos personales del titular (nombre, RUC, dirección, teléfono): ya son públicos en la web por obligación legal.

**Opciones para hacerlo privado sin romper la publicación.**
1. **Rápida y sin riesgo (recomendada ahora):** ajustar `publicar-produccion.sh` para que el repo de producción **no incluya** `backend/`, `docs/`, `hacer-*.js`, `rutas.js`, `previsualizar.py`, `publicar-produccion.sh`, `package-lock.json`, `material-pendiente.html` (la variable `FUERA` ya existe y está vacía; para carpetas hay que quitar los archivos con `git ls-files`). Producción queda con solo lo que el navegador necesita. El repo de trabajo (`giandeco-studio-design`) pasa a **privado**; staging por GitHub Pages dejaría de existir (Pages privado exige plan de pago) y se prueba en local con `previsualizar.py`. Producción (`giandeco-web`) debe seguir siendo público mientras use GitHub Pages gratuito.
2. **Producción también privada:** pasar el hosting a Cloudflare Pages / Netlify / Vercel conectados a un repo privado (plan gratuito suficiente), cambiar el DNS de giandeco.com y reemplazar el `CNAME`. Hay que revisar: los orígenes CORS de la función (`yedi06.github.io` ya no hace falta), `CATALOGO_URL` (seguiría siendo `https://giandeco.com/js/giandeco.js`) y las URL de redirección de Supabase Auth.
3. **GitHub Pro/Team** para Pages desde repo privado (cuesta, mantiene el flujo actual).

**Riesgos.** Cambiar de hosting implica una ventana de DNS; conviene hacerlo fuera de campaña (Navidad). La opción 1 no tiene riesgo para el sitio.
**Esfuerzo: opción 1 → S · opción 2 → M. Riesgo: bajo / medio.**
