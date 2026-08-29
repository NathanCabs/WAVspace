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
  where r.status <> 'REJECTED'
    and (lower(r.reference_code) = q or r.email = q)
  order by r.created_at desc
  limit 20;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-banners',
  'event-banners',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Anyone can read event banners" on storage.objects;
create policy "Anyone can read event banners"
  on storage.objects for select
  using (bucket_id = 'event-banners');

drop policy if exists "Admins can manage event banners" on storage.objects;
create policy "Admins can manage event banners"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'event-banners' and public.is_admin())
  with check (bucket_id = 'event-banners' and public.is_admin());
