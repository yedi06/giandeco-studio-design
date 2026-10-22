-- ==========================================================================
-- REVERSA de 2026-10-20_permisos-funciones.sql
-- Deja los permisos como estaban antes: EXECUTE para PUBLIC (por defecto de
-- Postgres) y para anon/authenticated (por defecto de Supabase).
-- es_admin() queda con el estado de schema.sql anterior: PUBLIC sí, anon sin
-- concesión directa (la heredaba por PUBLIC, que es justo lo que se corrige).
-- ==========================================================================
begin;

grant execute on function descontar_stock() to public, anon, authenticated;
grant execute on function pedidos_sanear()  to public, anon, authenticated;

grant execute on function es_admin() to public, authenticated;

commit;
