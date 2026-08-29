-- Cancel nights without deleting guest records, and keep the venue inquiry
-- that spawned a fan-hosted event so staff can notify the organizer.

alter type public.venue_request_status add value if not exists 'CANCELLED';

alter table public.events
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists venue_request_id uuid references public.venue_requests (id) on delete set null;

create unique index if not exists events_venue_request_id_key
  on public.events (venue_request_id)
  where venue_request_id is not null;

drop view if exists public.event_listings;
create view public.event_listings
with (security_invoker = true) as
select
  e.*,
  public.remaining_slots(e.id) as remaining_slots
from public.events e;

grant select on public.event_listings to anon, authenticated;

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
  if not found
    or v_event.is_published is not true
    or v_event.cancelled_at is not null
  then
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
