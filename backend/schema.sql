-- ==========================================================================
-- GIANDECO — BASE DE DATOS DE LA TIENDA   (PostgreSQL 15+ / Supabase)
-- Refleja, tabla por tabla, lo que hoy js/gd-tienda.js guarda en el
-- navegador. Los montos van en céntimos (integer) para no perder decimales.
-- ==========================================================================

create extension if not exists pgcrypto;

-- ---------- clientes: uno por usuario de auth.users ----------
create table clientes (
  id            uuid primary key references auth.users(id) on delete cascade,
  nombre        text not null,
  celular       text not null check (celular ~ '^9[0-9]{8}$'),
  email         text not null,
  acepta_promos boolean not null default false,   -- consentimiento separado (Ley 29733)
  promos_fecha  timestamptz,
  creado        timestamptz not null default now()
);

create table direcciones (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references clientes(id) on delete cascade,
  departamento text not null,
  provincia    text not null,
  distrito     text not null,
  direccion    text not null,
  referencia   text not null,
  inmueble     text,          -- casa, departamento, oficina, local comercial
  acceso       text,          -- primer piso, ascensor, solo escaleras
  principal    boolean not null default false
);

create table datos_comprobante (
  cliente_id  uuid primary key references clientes(id) on delete cascade,
  tipo        text not null check (tipo in ('boleta','factura')),
  tipo_doc    text check (tipo_doc in ('DNI','Carné de extranjería','Pasaporte')),
  num_doc     text,
  ruc         text check (ruc is null or ruc ~ '^(10|20)[0-9]{9}$'),
  razon       text,
  dir_fiscal  text
);

-- ---------- catálogo ----------
create table productos (
  clave       text primary key,                 -- la misma clave de la URL: comoda-flow
  linea       text not null check (linea in ('muebleria','iluminacion','navidad')),
  categoria   text not null,
  nombre      text not null,
  nota        text not null default '',
  precio      integer,                          -- céntimos; null = a consultar
  imagenes    text[] not null default '{}',
  familia     text,
  variante    text,
  largo_cm    integer,
  stock       integer,                          -- null = no se controla
  activo      boolean not null default true,
  actualizado timestamptz not null default now()
);

create table cupones (
  codigo    text primary key,
  pct       numeric(5,2),
  monto     integer,
  vence     timestamptz,
  usos_max  integer,
  usos      integer not null default 0,
  check ((pct is not null) <> (monto is not null))
);

-- ---------- pedidos ----------
create type estado_pedido as enum ('registrado','confirmado','en_preparacion','en_camino','entregado','cancelado');

create table pedidos (
  id            uuid primary key default gen_random_uuid(),
  numero        text not null unique,            -- GD-261008-9411
  cliente_id    uuid references clientes(id) on delete set null,
  estado        estado_pedido not null default 'registrado',
  -- datos del comprador tal como se escribieron en el checkout
  nombre        text not null,
  celular       text not null,
  email         text not null,
  comprobante   jsonb not null,                  -- {tipo, tipo_doc, num_doc | ruc, razon, dir_fiscal}
  entrega       jsonb not null,                  -- {tipo, departamento, provincia, distrito, direccion, referencia, inmueble, acceso, horario, recibe}
  armado        boolean not null default false,
  medio_pago    text,
  nota          text,
  cupon         text references cupones(codigo),
  subtotal      integer not null default 0,
  descuento     integer not null default 0,
  envio         integer,                         -- null = por confirmar
  armado_monto  integer,
  total         integer,                         -- se fija cuando el estudio confirma
  acepta_terminos_fecha timestamptz not null default now(),
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now()
);
create index on pedidos (cliente_id, creado desc);

create table pedido_items (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references pedidos(id) on delete cascade,
  producto    text references productos(clave),  -- null = pieza de espacio, a cotizar
  nombre      text not null,
  categoria   text,
  cantidad    integer not null check (cantidad between 1 and 99),
  precio_unit integer,                           -- null = a cotizar
  origen      text                               -- página del espacio de donde salió
);

create table pedido_eventos (                    -- la línea de tiempo que ve el cliente
  id        bigint generated always as identity primary key,
  pedido_id uuid not null references pedidos(id) on delete cascade,
  estado    estado_pedido not null,
  detalle   text,
  creado    timestamptz not null default now()
);

-- ---------- pagos: una fila por intento en la pasarela ----------
create type estado_pago as enum ('pendiente','pagado','rechazado','vencido','devuelto');

create table pagos (
  id           uuid primary key default gen_random_uuid(),
  pedido_id    uuid not null references pedidos(id) on delete cascade,
  pasarela     text not null,                    -- izipay, culqi, mercadopago, manual
  medio        text not null,                    -- tarjeta, yape, plin, pagoefectivo, transferencia, contra_entrega…
  referencia   text,                             -- id de la operación en la pasarela
  monto        integer not null,
  estado       estado_pago not null default 'pendiente',
  respuesta    jsonb,                            -- lo que devolvió la pasarela, sin datos de tarjeta
  creado       timestamptz not null default now(),
  confirmado   timestamptz,
  unique (pasarela, referencia)                  -- un webhook repetido no duplica el pago
);

-- ---------- opiniones, preguntas y testimonios ----------
create type estado_publicacion as enum ('en_revision','publicada','rechazada');

create table opiniones (
  id          uuid primary key default gen_random_uuid(),
  producto    text not null references productos(clave),
  pedido_id   uuid not null references pedidos(id),     -- sin pedido no hay opinión
  cliente_id  uuid references clientes(id) on delete set null,
  pieza       smallint not null check (pieza between 1 and 5),
  foto        smallint not null check (foto between 1 and 5),
  entrega     smallint not null check (entrega between 1 and 5),
  atencion    smallint not null check (atencion between 1 and 5),
  texto       text not null check (char_length(texto) >= 20),
  ambiente    text,
  autor       text not null,
  lugar       text,
  autoriza    boolean not null default false,
  estado      estado_publicacion not null default 'en_revision',
  respuesta   text,                                      -- respuesta pública del estudio
  creado      timestamptz not null default now(),
  unique (producto, pedido_id)
);

create table preguntas (
  id         uuid primary key default gen_random_uuid(),
  producto   text not null references productos(clave),
  cliente_id uuid references clientes(id) on delete set null,
  pregunta   text not null,
  respuesta  text,
  estado     estado_publicacion not null default 'en_revision',
  creado     timestamptz not null default now()
);

create table testimonios (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  proyecto   text not null,
  autor      text not null,
  rol        text,
  antes      text not null,
  despues    text not null,
  recomienda smallint not null check (recomienda between 0 and 10),
  autoriza   boolean not null default false,
  enlace     text,
  estado     estado_publicacion not null default 'en_revision',
  creado     timestamptz not null default now()
);

-- ---------- proyectos de diseño (panel «Mis proyectos») ----------
create table proyectos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nombre     text not null,
  mundo      text not null check (mundo in ('retail','hogar')),
  etapa      smallint not null default 1 check (etapa between 1 and 4),  -- visita, propuesta, mobiliario, montaje
  nota       text,
  actualizado timestamptz not null default now()
);

-- ---------- libro de reclamaciones: correlativo y sin borrado ----------
create sequence reclamo_seq;
create table reclamos (
  id          uuid primary key default gen_random_uuid(),
  numero      text not null unique default ('LR-' || to_char(now(),'YYYY') || '-' || lpad(nextval('reclamo_seq')::text, 6, '0')),
  fecha       timestamptz not null default now(),
  nombre      text not null,
  tipo_doc    text not null,
  num_doc     text not null,
  domicilio   text not null,
  telefono    text not null,
  email       text not null,
  apoderado   text,
  bien        text not null check (bien in ('Producto','Servicio')),
  descripcion text not null,
  pedido      text,
  monto       text,
  tipo        text not null check (tipo in ('Reclamo','Queja')),
  detalle     text not null,
  pedido_consumidor text not null,
  respuesta   text,                    -- observaciones y acciones del proveedor
  respondido  timestamptz,
  vence       timestamptz              -- 15 días hábiles: lo calcula el backend al crear
);
revoke update (numero, fecha, nombre, tipo_doc, num_doc, domicilio, telefono, email, bien, descripcion, tipo, detalle, pedido_consumidor), delete on reclamos from public;

-- ==========================================================================
-- SEGURIDAD POR FILAS
-- El navegador solo lee lo público y lo propio. Todo lo que mueve dinero o
-- estado (crear pedido, confirmar pago, publicar opinión) pasa por el
-- backend con la clave de servicio, nunca desde el navegador.
-- ==========================================================================
alter table clientes          enable row level security;
alter table direcciones       enable row level security;
alter table datos_comprobante enable row level security;
alter table productos         enable row level security;
alter table cupones           enable row level security;
alter table pedidos           enable row level security;
alter table pedido_items      enable row level security;
alter table pedido_eventos    enable row level security;
alter table pagos             enable row level security;
alter table opiniones         enable row level security;
alter table preguntas         enable row level security;
alter table testimonios       enable row level security;
alter table proyectos         enable row level security;
alter table reclamos          enable row level security;

create policy "catálogo público"        on productos   for select using (activo);
create policy "opiniones publicadas"    on opiniones   for select using (estado = 'publicada' or cliente_id = auth.uid());
create policy "preguntas publicadas"    on preguntas   for select using (estado = 'publicada' or cliente_id = auth.uid());
create policy "testimonios publicados"  on testimonios for select using (estado = 'publicada' or cliente_id = auth.uid());

create policy "mi ficha"        on clientes          for all    using (id = auth.uid())         with check (id = auth.uid());
create policy "mis direcciones" on direcciones       for all    using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "mi comprobante"  on datos_comprobante for all    using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "mis pedidos"     on pedidos           for select using (cliente_id = auth.uid());
create policy "mis items"       on pedido_items      for select using (exists (select 1 from pedidos p where p.id = pedido_id and p.cliente_id = auth.uid()));
create policy "mis eventos"     on pedido_eventos    for select using (exists (select 1 from pedidos p where p.id = pedido_id and p.cliente_id = auth.uid()));
create policy "mis pagos"       on pagos             for select using (exists (select 1 from pedidos p where p.id = pedido_id and p.cliente_id = auth.uid()));
create policy "mis proyectos"   on proyectos         for select using (cliente_id = auth.uid());
-- cupones y reclamos: sin política = inaccesibles desde el navegador; solo el backend.

-- ==========================================================================
-- ADMINISTRACIÓN  (lo que usa admin.html)
-- ==========================================================================
create table admins (
  id     uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol    text not null default 'admin' check (rol in ('admin','ventas'))
);
alter table admins enable row level security;
create policy "ver mi rol" on admins for select using (id = auth.uid());

create or replace function es_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where id = auth.uid()) $$;

-- ajustes de la tienda: empresa, tarifas de envío, medios de pago activos
create table config (
  clave text primary key,
  valor jsonb not null,
  actualizado timestamptz not null default now()
);
alter table config enable row level security;
create policy "ajustes públicos" on config for select using (clave in ('empresa','envio','pago','tienda'));

alter table pedidos add column pagado boolean not null default false;
alter table pedidos add column nota_interna text;

-- el equipo del estudio lo ve y lo edita todo
do $$
declare t text;
begin
  foreach t in array array['clientes','direcciones','datos_comprobante','productos','cupones','pedidos','pedido_items',
                           'pedido_eventos','pagos','opiniones','preguntas','testimonios','proyectos','reclamos','config']
  loop
    execute format('create policy "admin total" on %I for all using (es_admin()) with check (es_admin())', t);
  end loop;
end $$;
