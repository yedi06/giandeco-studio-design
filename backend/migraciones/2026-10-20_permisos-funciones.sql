-- ==========================================================================
-- GIANDECO — PERMISOS DE LAS FUNCIONES   (PostgreSQL en Supabase)
-- Migración 2026-10-20.  Reversa: 2026-10-20_permisos-funciones_ROLLBACK.sql
--
-- Motivo: el «revoke … from anon» que traía schema.sql no basta. Postgres da
-- EXECUTE a PUBLIC por defecto y Supabase además lo concede a anon y
-- authenticated; anon sigue heredando el permiso por PUBLIC y el asesor de
-- seguridad de Supabase lo marca. Aquí se quita de PUBLIC y de los dos roles.
--
-- Qué NO cambia:
--  · Los triggers siguen funcionando: Postgres comprueba EXECUTE al CREAR el
--    trigger, no al dispararlo.
--  · pedidos_sanear() es security definer: llama a es_admin() con los permisos
--    de su dueño, así que un visitante anónimo puede seguir registrando pedidos.
--  · estado_pedido() y registrar_reclamo() siguen siendo PÚBLICAS A PROPÓSITO:
--    las usa la tienda sin sesión (seguimiento de pedido por número + celular, y
--    Libro de Reclamaciones). No se tocan aquí.
--  · marcar_pagado() ya está restringida (solo service_role) en pagos.sql.
--
-- Se ejecuta una sola vez en el editor SQL de Supabase. Puede repetirse.
-- ==========================================================================
begin;

-- Funciones internas (las usan los triggers): no deben poder invocarse desde la API pública
revoke execute on function descontar_stock() from public, anon, authenticated;
revoke execute on function pedidos_sanear()  from public, anon, authenticated;

-- es_admin la usan las políticas RLS de usuarios autenticados (el panel)
revoke execute on function es_admin() from public, anon;
grant  execute on function es_admin() to authenticated;

commit;

-- Opcional (no incluido arriba por no estar en el alcance acordado): pedidos_conservar_pago()
-- es una función de trigger; si el asesor la marcara, el mismo patrón sirve:
--   revoke execute on function pedidos_conservar_pago() from public, anon, authenticated;
