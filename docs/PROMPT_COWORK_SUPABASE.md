# Prompt para Claude Cowork — migración de permisos en Supabase

Copia desde «PROMPT» hasta el final y pégalo en Claude Cowork (con tu sesión de Supabase abierta en el navegador).
No contiene claves ni secretos.

---

## PROMPT

Eres mi asistente para una tarea puntual en el panel de Supabase del proyecto de giandeco.com. Haz exactamente esto, en orden, y no hagas nada más:

**Reglas:** no borres ni cambies datos de ninguna tabla; no toques Authentication, Storage ni Edge Functions; no copies ni muestres claves o secretos; si algo falla o no coincide con lo esperado, DETENTE y cuéntame qué viste (con captura) sin intentar arreglarlo.

**1. Abre el proyecto** de Giandeco en https://supabase.com/dashboard (el que tiene las tablas `pedidos`, `reclamos`, `config`, `admins`) → menú **SQL Editor** → **New query**.

**2. Antes de cambiar nada**, pega y ejecuta esta consulta de comprobación y guárdame el resultado (captura):

```sql
select proname,
       has_function_privilege('anon', oid, 'execute')          as anon,
       has_function_privilege('authenticated', oid, 'execute') as authenticated
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('descontar_stock','pedidos_sanear','es_admin','estado_pedido','registrar_reclamo','marcar_pagado')
order by proname;
```

**3. Ejecuta la migración.** Abre una query nueva, pega TODO este bloque y pulsa **Run**:

```sql
begin;

revoke execute on function descontar_stock() from public, anon, authenticated;
revoke execute on function pedidos_sanear()  from public, anon, authenticated;

revoke execute on function es_admin() from public, anon;
grant  execute on function es_admin() to authenticated;

commit;
```

Debe terminar con «Success. No rows returned». Si da error, detente.

**4. Verifica.** Vuelve a ejecutar la consulta del paso 2. Resultado esperado:

| proname | anon | authenticated |
|---|---|---|
| descontar_stock | false | false |
| es_admin | false | true |
| estado_pedido | true | true |
| marcar_pagado | false | false |
| pedidos_sanear | false | false |
| registrar_reclamo | true | true |

(`estado_pedido` y `registrar_reclamo` deben seguir en `true`: son públicas a propósito.)

**5. Asesor de seguridad:** ve a **Database → Advisors → Security Advisor** (o «Advisors» en el menú) y pulsa **Refresh / Rerun**. Dime si siguen apareciendo avisos sobre `descontar_stock`, `pedidos_sanear` o `es_admin` (esos tres deben haber desaparecido) y lista los avisos que queden, solo los títulos.

**6. Informe final:** pégame (a) la tabla del paso 2 (antes), (b) la tabla del paso 4 (después), (c) la lista del asesor. No ejecutes nada más.

**Si yo te pido «revertir»:** ejecuta solo esto y repite la consulta de comprobación:

```sql
begin;
grant execute on function descontar_stock() to public, anon, authenticated;
grant execute on function pedidos_sanear()  to public, anon, authenticated;
grant execute on function es_admin() to public, authenticated;
commit;
```

---

## Después, por tu cuenta (2 minutos)

1. En giandeco.com haz una **compra de prueba** con pago directo (o pide que la haga alguien): debe registrarse el pedido y aparecer en el panel.
2. Entra a **giandeco.com/admin** con tu correo autorizado: debe abrir pedidos y Opiniones sin errores.
