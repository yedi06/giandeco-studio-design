-- ==========================================================================
-- GIANDECO — LIBRO DE RECLAMACIONES   (PostgreSQL en Supabase)
--
-- Cada hoja recibe un número correlativo que asigna la base de datos (no el
-- navegador), como pide el reglamento del Libro de Reclamaciones.
-- Se ejecuta una sola vez en el editor SQL de Supabase. Puede repetirse.
-- ==========================================================================

create sequence if not exists reclamos_correlativo;

create or replace function registrar_reclamo(p_datos jsonb) returns jsonb
language plpgsql security definer set search_path = public as
$$
declare k bigint; n text; f timestamptz := now();
begin
  if p_datos is null or pg_column_size(p_datos) > 20000 then raise exception 'hoja inválida'; end if;
  k := nextval('reclamos_correlativo');
  n := 'LR-' || to_char(f at time zone 'America/Lima', 'YYYY') || '-' || lpad(k::text, 6, '0');
  insert into reclamos (id, datos)
    values (n, p_datos || jsonb_build_object('n', n, 'correlativo', k, 'registrado', f));
  return jsonb_build_object('n', n, 'fecha', to_char(f at time zone 'America/Lima', 'DD/MM/YYYY HH24:MI'));
end
$$;
grant execute on function registrar_reclamo(jsonb) to anon, authenticated;
