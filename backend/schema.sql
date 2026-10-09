-- ==========================================================================
-- GIANDECO — BASE DE DATOS DE LA TIENDA   (PostgreSQL en Supabase)
-- Proyecto: giandeco · región sa-east-1 (São Paulo)
--
-- Cada colección guarda el mismo objeto que usa la web (columna datos, jsonb)
-- con su identificador. La tienda solo puede INSERTAR; leer y modificar es
-- exclusivo del equipo del estudio (tabla admins), salvo los ajustes
-- públicos que la tienda necesita para pintarse.
--
-- Se ejecuta una sola vez en el editor SQL de Supabase.
-- ==========================================================================

-- ---------- quién administra ----------
create table if not exists admins (email text primary key);
alter table admins enable row level security;

create or replace function es_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where email = lower(auth.jwt() ->> 'email')) $$;

drop policy if exists "ver si soy admin" on admins;
create policy "ver si soy admin" on admins for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

-- ---------- colecciones ----------
create table if not exists pedidos     (id text primary key, datos jsonb not null, creado timestamptz not null default now());
create table if not exists reclamos    (id text primary key, datos jsonb not null, creado timestamptz not null default now());
create table if not exists opiniones   (id text primary key, datos jsonb not null, creado timestamptz not null default now());
create table if not exists preguntas   (id text primary key, datos jsonb not null, creado timestamptz not null default now());
create table if not exists testimonios (id text primary key, datos jsonb not null, creado timestamptz not null default now());

do $$
declare t text;
begin
  foreach t in array array['pedidos','reclamos','opiniones','preguntas','testimonios'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "la tienda registra" on %I', t);
    execute format('drop policy if exists "el estudio administra" on %I', t);
    -- la web pública solo puede añadir filas, de tamaño acotado
    execute format('create policy "la tienda registra" on %I for insert to anon, authenticated with check (pg_column_size(datos) < 60000 and char_length(id) between 4 and 60)', t);
    execute format('create policy "el estudio administra" on %I for all to authenticated using (es_admin()) with check (es_admin())', t);
  end loop;
end $$;

-- ---------- ajustes de la tienda ----------
-- clave 'config': empresa, envío, medios de pago, opiniones publicadas…
-- clave 'prod':   precios, visibilidad y piezas nuevas definidas en el panel
create table if not exists config (clave text primary key, valor jsonb not null, actualizado timestamptz not null default now());
alter table config enable row level security;
drop policy if exists "ajustes públicos" on config;
drop policy if exists "el estudio ajusta" on config;
create policy "ajustes públicos" on config for select to anon, authenticated using (clave in ('config','prod'));
create policy "el estudio ajusta" on config for all to authenticated using (es_admin()) with check (es_admin());

-- ---------- seguimiento: el cliente consulta su pedido con número y celular ----------
create or replace function estado_pedido(p_n text, p_cel text) returns jsonb
language sql stable security definer set search_path = public as
$$
  select jsonb_build_object(
    'estado', coalesce((datos ->> 'estado')::int, 0),
    'envio', datos -> 'envio',
    'armadoMonto', datos -> 'armadoMonto',
    'pagado', coalesce((datos ->> 'pagado')::boolean, false))
  from pedidos
  where id = p_n and datos -> 'cliente' ->> 'cel' = p_cel
$$;
grant execute on function estado_pedido(text, text) to anon, authenticated;
revoke execute on function es_admin() from anon;

-- ---------- stock: cada pedido nuevo descuenta las unidades pedidas ----------
-- El stock vive en config 'prod' (over.<clave>.stock). Sin dato, vale 1.
create or replace function descontar_stock() returns trigger
language plpgsql security definer set search_path = public as
$$
declare it jsonb; k text; q int; actual int; v jsonb;
begin
  select valor into v from config where clave = 'prod';
  v := coalesce(v, '{}'::jsonb);
  if v -> 'over' is null then v := jsonb_set(v, '{over}', '{}'::jsonb); end if;
  for it in select * from jsonb_array_elements(coalesce(new.datos -> 'items', '[]'::jsonb)) loop
    k := it ->> 'key';
    if k is not null then
      q := greatest(1, coalesce((it ->> 'qty')::int, 1));
      actual := coalesce((v -> 'over' -> k ->> 'stock')::int, 1);
      v := jsonb_set(v, array['over', k], coalesce(v -> 'over' -> k, '{}'::jsonb) || jsonb_build_object('stock', greatest(0, actual - q)));
    end if;
  end loop;
  insert into config (clave, valor) values ('prod', v)
    on conflict (clave) do update set valor = excluded.valor, actualizado = now();
  return new;
exception when others then
  return new;   -- un dato raro en el pedido nunca impide registrarlo
end
$$;

drop trigger if exists pedidos_descuenta_stock on pedidos;
create trigger pedidos_descuenta_stock after insert on pedidos
  for each row when (coalesce(new.datos ->> 'demo', 'false') <> 'true')
  execute function descontar_stock();
