-- WAVspace core schema: profiles, cafe settings, events, registrations, venue requests.
-- RLS: public can read published events; lookups and registration inserts go through SECURITY DEFINER RPCs.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin');
create type public.event_category as enum ('cse', 'acoustic', 'workshop', 'other');
create type public.consumable_category as enum ('drink', 'food');
create type public.registration_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type public.venue_request_status as enum ('PENDING', 'APPROVED', 'DECLINED');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'admin',
  display_name text,
  created_at timestamptz not null default now()
);

create table public.cafe_settings (
  id uuid primary key default gen_random_uuid(),
  cafe_name text not null,
  tagline text,
  about text,
  logo_url text,
  gcash_qr_url text,
  maya_qr_url text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  ewallet_name text,
  ewallet_number text,
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  banner_url text,
  max_slots integer not null check (max_slots > 0),
  ticket_price numeric(10, 2) not null default 0,
  is_cafe_hosted boolean not null default true,
  category public.event_category not null default 'other',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consumable_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  category public.consumable_category not null default 'drink',
  extra_price numeric(10, 2) not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.freebie_kits (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  sort_order integer not null default 0
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete restrict,
  kit_id uuid not null references public.freebie_kits (id) on delete restrict,
  attendee_name text not null,
  email text not null,
  phone text,
  total_amount numeric(10, 2) not null,
  payment_proof_url text,
  status public.registration_status not null default 'PENDING',
  reference_code text not null unique,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registration_consumables (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  consumable_option_id uuid not null references public.consumable_options (id) on delete restrict,
  primary key (registration_id, consumable_option_id)
);

create table public.venue_requests (
  id uuid primary key default gen_random_uuid(),
  organizer_name text not null,
  contact_email text not null,
  contact_phone text,
  proposed_date date not null,
  expected_attendance integer,
  event_description text not null,
  status public.venue_request_status not null default 'PENDING',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index registrations_email_idx on public.registrations (email);
create index registrations_status_idx on public.registrations (status);
create index registrations_event_id_idx on public.registrations (event_id);
create index events_date_published_idx on public.events (event_date, is_published);
create index consumable_options_event_id_idx on public.consumable_options (event_id);
create index freebie_kits_event_id_idx on public.freebie_kits (event_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cafe_settings_updated_at
  before update on public.cafe_settings
  for each row execute function public.set_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger registrations_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

create trigger venue_requests_updated_at
  before update on public.venue_requests
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'admin'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.generate_reference_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
  taken boolean;
begin
  loop
    code := 'WAV-' || lpad(floor(random() * 10000)::int::text, 4, '0');
    select exists(select 1 from public.registrations where reference_code = code) into taken;
    exit when not taken;
  end loop;
  return code;
end;
$$;

create or replace function public.remaining_slots(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select e.max_slots - coalesce((
    select count(*)::int
    from public.registrations r
    where r.event_id = p_event_id
      and r.status in ('PENDING', 'APPROVED')
  ), 0)
  from public.events e
  where e.id = p_event_id;
$$;

create or replace view public.event_listings
with (security_invoker = true) as
select
  e.*,
  public.remaining_slots(e.id) as remaining_slots
from public.events e;

create or replace function public.create_registration(
  p_event_id uuid,
  p_kit_id uuid,
  p_attendee_name text,
  p_email text,
  p_phone text,
  p_consumable_ids uuid[],
  p_payment_proof_path text,
  p_total_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_kit public.freebie_kits%rowtype;
  v_slots integer;
  v_code text;
  v_reg_id uuid;
  v_expected numeric;
  v_consumable public.consumable_options%rowtype;
  v_cid uuid;
begin
  if p_attendee_name is null or length(trim(p_attendee_name)) < 2 then
    raise exception 'Please enter a valid attendee name.';
  end if;

  if p_email is null or p_email !~* '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Please enter a valid email address.';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found or v_event.is_published is not true then
    raise exception 'This event is not available for registration.';
  end if;

  v_slots := public.remaining_slots(p_event_id);
  if v_slots is null or v_slots <= 0 then
    raise exception 'This event is fully booked.';
  end if;

  select * into v_kit
  from public.freebie_kits
  where id = p_kit_id
    and event_id = p_event_id;

  if not found then
    raise exception 'Please choose a valid freebie kit.';
  end if;

  v_expected := v_kit.price;

  if p_consumable_ids is not null then
    foreach v_cid in array p_consumable_ids loop
      select * into v_consumable
      from public.consumable_options
      where id = v_cid
        and event_id = p_event_id
        and is_active = true;

      if not found then
        raise exception 'Please choose a valid drink or food option.';
      end if;

      v_expected := v_expected + v_consumable.extra_price;
    end loop;
  end if;

  if abs(coalesce(v_expected, 0) - coalesce(p_total_amount, 0)) > 0.05 then
    raise exception 'The submitted total does not match the selected options.';
  end if;

  v_code := public.generate_reference_code();

  insert into public.registrations (
    event_id,
    kit_id,
    attendee_name,
    email,
    phone,
    total_amount,
    payment_proof_url,
    reference_code
  )
  values (
    p_event_id,
    p_kit_id,
    trim(p_attendee_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone, '')), ''),
    p_total_amount,
    p_payment_proof_path,
    v_code
  )
  returning id into v_reg_id;

  if p_consumable_ids is not null and array_length(p_consumable_ids, 1) is not null then
    insert into public.registration_consumables (registration_id, consumable_option_id)
    select v_reg_id, unnest(p_consumable_ids);
  end if;

  return jsonb_build_object(
    'id', v_reg_id,
    'reference_code', v_code,
    'total_amount', p_total_amount
  );
end;
$$;

create or replace function public.lookup_registrations(p_query text)
returns table (
  id uuid,
  reference_code text,
  attendee_name text,
  email text,
  status public.registration_status,
  total_amount numeric,
  created_at timestamptz,
  event_title text,
  event_date date,
  kit_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  q text := lower(trim(coalesce(p_query, '')));
begin
  if length(q) < 3 then
    return;
  end if;

  return query
  select
    r.id,
    r.reference_code,
    r.attendee_name,
    r.email,
    r.status,
    r.total_amount,
    r.created_at,
    e.title,
    e.event_date,
    k.name
  from public.registrations r
  join public.events e on e.id = r.event_id
  join public.freebie_kits k on k.id = r.kit_id
  where lower(r.reference_code) = q
     or r.email = q
  order by r.created_at desc
  limit 20;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cafe_settings enable row level security;
alter table public.events enable row level security;
alter table public.consumable_options enable row level security;
alter table public.freebie_kits enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_consumables enable row level security;
alter table public.venue_requests enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Cafe settings are public"
  on public.cafe_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can update cafe settings"
  on public.cafe_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Published events are public"
  on public.events for select
  to anon, authenticated
  using (is_published = true or public.is_admin());

create policy "Admins manage events"
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Published event options are public"
  on public.consumable_options for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.is_published = true or public.is_admin())
    )
  );

create policy "Admins manage consumables"
  on public.consumable_options for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Published event kits are public"
  on public.freebie_kits for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.is_published = true or public.is_admin())
    )
  );

create policy "Admins manage kits"
  on public.freebie_kits for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage registrations"
  on public.registrations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage registration consumables"
  on public.registration_consumables for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Anyone can submit a venue request"
  on public.venue_requests for insert
  to anon, authenticated
  with check (true);

create policy "Admins manage venue requests"
  on public.venue_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create policy "Admins can read payment proofs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

create policy "Admins can manage payment proofs"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin())
  with check (bucket_id = 'payment-proofs' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.cafe_settings to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.consumable_options to anon, authenticated;
grant select on public.freebie_kits to anon, authenticated;
grant select on public.event_listings to anon, authenticated;
grant insert on public.venue_requests to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.cafe_settings to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.consumable_options to authenticated;
grant select, insert, update, delete on public.freebie_kits to authenticated;
grant select, insert, update, delete on public.registrations to authenticated;
grant select, insert, update, delete on public.registration_consumables to authenticated;
grant select, insert, update, delete on public.venue_requests to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.remaining_slots(uuid) to anon, authenticated;
grant execute on function public.create_registration(uuid, uuid, text, text, text, uuid[], text, numeric) to anon, authenticated;
grant execute on function public.lookup_registrations(text) to anon, authenticated;
grant execute on function public.generate_reference_code() to authenticated;
