-- ==========================================================================
-- GIANDECO — PAGOS EN LÍNEA   (PostgreSQL en Supabase)
--
-- Complementa backend/schema.sql. Lo usa la función backend/functions/pago,
-- que es la única que habla con la pasarela y la única que marca un pedido
-- como pagado.
--
-- Se ejecuta una sola vez en el editor SQL de Supabase. Puede repetirse.
-- ==========================================================================

-- ---------- intentos de cobro ----------
-- Una fila por intento. Nunca guarda datos de tarjeta: solo el identificador
-- del cargo en la pasarela, la marca y los cuatro últimos dígitos.
create table if not exists pagos (
  id          uuid primary key default gen_random_uuid(),
  pedido      text not null references pedidos(id),
  proveedor   text not null default 'culqi',
  estado      text not null check (estado in ('procesando','3ds','pagado','rechazado','incierto')),
  monto       integer not null check (monto > 0),      -- en céntimos
  moneda      text not null default 'PEN',
  medio       text,                                     -- tarjeta | yape
  cargo       text,                                     -- chr_…
  detalle     jsonb not null default '{}'::jsonb,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists pagos_pedido on pagos (pedido, creado desc);

-- Un pedido no puede tener dos cobros vivos a la vez: mientras haya uno en
-- curso, sin respuesta clara o ya cobrado, el siguiente intento se rechaza
-- aquí, en la base, aunque lleguen dos clics al mismo tiempo.
create unique index if not exists pagos_uno_vivo on pagos (pedido)
  where estado in ('procesando','incierto','pagado');

alter table pagos enable row level security;
drop policy if exists "el estudio ve los pagos" on pagos;
create policy "el estudio ve los pagos" on pagos for select to authenticated using (es_admin());
-- sin política de escritura: solo escribe la función, con la clave de servicio

-- ---------- lo que un visitante no puede decidir ----------
-- La web pública inserta el pedido, así que estos campos no pueden venir de
-- ella: estado, pago recibido, envío, armado y total los fija el estudio o
-- la pasarela.
create or replace function pedidos_sanear() returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  if not es_admin() then
    new.datos := (new.datos - 'pagado' - 'pagoOnline' - 'total' - 'envio' - 'armadoMonto' - 'notaInterna')
                 || jsonb_build_object('estado', 0);
  end if;
  return new;
end
$$;
drop trigger if exists pedidos_sanea on pedidos;
create trigger pedidos_sanea before insert on pedidos
  for each row execute function pedidos_sanear();
-- función interna de un trigger: no debe poder invocarse desde la API pública
revoke execute on function pedidos_sanear() from public, anon, authenticated;

-- Un pago cobrado por la pasarela no se pierde ni se desmarca al guardar el
-- pedido desde el panel con una copia anterior.
create or replace function pedidos_conservar_pago() returns trigger
language plpgsql set search_path = public as
$$
begin
  if old.datos -> 'pagoOnline' is not null then
    new.datos := new.datos || jsonb_build_object('pagado', true, 'pagoOnline', old.datos -> 'pagoOnline');
  end if;
  return new;
end
$$;
drop trigger if exists pedidos_conserva_pago on pedidos;
create trigger pedidos_conserva_pago before update on pedidos
  for each row execute function pedidos_conservar_pago();

-- ---------- marcar pagado ----------
-- Solo la función de pagos (clave de servicio) puede llamarla.
create or replace function marcar_pagado(p_n text, p_pago jsonb) returns boolean
language plpgsql security definer set search_path = public as
$$
begin
  update pedidos
     set datos = datos || jsonb_build_object('pagado', true, 'pagoOnline', p_pago)
   where id = p_n;
  return found;
end
$$;
revoke execute on function marcar_pagado(text, jsonb) from public, anon, authenticated;
grant execute on function marcar_pagado(text, jsonb) to service_role;
