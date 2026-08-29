-- Public event URLs use a unique title slug. Operational reset wipes demo/live
-- bookings without touching cafe settings or admin accounts.

alter table public.events
  add column if not exists slug text;

with numbered as (
  select
    id,
    coalesce(
      nullif(
        trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'event'
    ) as base_slug,
    row_number() over (
      partition by coalesce(
        nullif(
          trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')),
          ''
        ),
        'event'
      )
      order by created_at, id
    ) as n
  from public.events
  where slug is null or slug = ''
)
update public.events e
set slug = case
  when numbered.n = 1 then numbered.base_slug
  else numbered.base_slug || '-' || numbered.n::text
end
from numbered
where e.id = numbered.id;

update public.events
set slug = 'event-' || left(replace(id::text, '-', ''), 8)
where slug is null or slug = '';

alter table public.events
  alter column slug set not null;

create unique index if not exists events_slug_key on public.events (slug);

-- Views expand e.* at create time, so recreate after adding slug.
drop view if exists public.event_listings;
create view public.event_listings
with (security_invoker = true) as
select
  e.*,
  public.remaining_slots(e.id) as remaining_slots
from public.events e;

grant select on public.event_listings to anon, authenticated;

create or replace function public.reset_operational_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  delete from public.registrations;
  delete from public.events;
  delete from public.venue_requests;
end;
$$;

grant execute on function public.reset_operational_data() to authenticated;
