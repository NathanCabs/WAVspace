-- Demo tenant: WAV Cafe. Safe to re-run on an empty database.

insert into public.cafe_settings (
  id,
  cafe_name,
  tagline,
  about,
  gcash_qr_url,
  maya_qr_url,
  bank_name,
  bank_account_name,
  bank_account_number,
  ewallet_name,
  ewallet_number
)
values (
  '00000000-0000-0000-0000-000000000001',
  'WAV Cafe',
  'Pour-over, playlists, and packed cupsleeve nights.',
  'WAV Cafe is a neighborhood espresso bar that opens its floor to community hosts — K-pop cupsleeve events, acoustic sets, and small-batch workshops. WAVspace is the booking layer: pick a drink, claim a kit, send proof, and we confirm your slot.',
  '/payments/gcash.svg',
  '/payments/maya.svg',
  'BDO Unibank',
  'WAV Cafe Co.',
  '0045-8012-3388',
  'GCash',
  '0917 555 0142'
)
on conflict (id) do nothing;

insert into public.events (
  id, slug, title, description, event_date, start_time, end_time, banner_url,
  max_slots, ticket_price, is_cafe_hosted, category, is_published
)
values
  (
    'a1111111-1111-4111-8111-111111111111',
    'kkampakz-birthday-cse',
    'Kkampakz Birthday CSE',
    'A fan-hosted birthday cupsleeve for Nakyoung and Sohyun, with Polaroid walls, trade tables, and a WAV Cafe drink included in every kit. Bring photocards, stay for the playlist, leave with a cupholder.',
    '2026-10-13',
    '13:00',
    '18:00',
    '/events/kkampakz.jpg',
    40,
    350,
    false,
    'cse',
    true
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    'late-light-acoustic-night',
    'Late Light Acoustic Night',
    'A cafe-hosted evening of original songs, warm lamps, and slow bars. Limited seated tables plus standing room along the counter.',
    '2026-09-13',
    '19:00',
    '22:00',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    28,
    200,
    true,
    'acoustic',
    true
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    'latte-art-lab',
    'Latte Art Lab',
    'A hands-on workshop with WAV Cafe baristas. You will pull, pour, and take home a tasting flight plus a small kit of practice cups.',
    '2026-10-04',
    '10:00',
    '13:00',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    16,
    500,
    true,
    'workshop',
    true
  )
on conflict (id) do nothing;

insert into public.events (
  id, slug, title, description, event_date, start_time, end_time, banner_url,
  max_slots, ticket_price, is_cafe_hosted, category, custom_category, is_published
)
values (
  'a4444444-4444-4444-8444-444444444444',
  'july-vinyl-swap',
  'July Vinyl Swap',
  'A quiet afternoon of crate digging, sticker trades, and pour-overs. This night has already wrapped.',
  '2026-07-19',
  '14:00',
  '18:00',
  'https://images.unsplash.com/photo-1483412036650-ba5b409012c0?auto=format&fit=crop&w=1600&q=80',
  24,
  150,
  true,
  'other',
  'Swap',
  true
)
on conflict (id) do nothing;

insert into public.consumable_options (id, event_id, name, category, extra_price, sort_order)
values
  ('b1111111-1111-4111-8111-000000000001', 'a1111111-1111-4111-8111-111111111111', 'Iced Latte', 'drink', 0, 1),
  ('b1111111-1111-4111-8111-000000000002', 'a1111111-1111-4111-8111-111111111111', 'Peach Tea', 'drink', 0, 2),
  ('b1111111-1111-4111-8111-000000000003', 'a1111111-1111-4111-8111-111111111111', 'Americano', 'drink', 0, 3),
  ('b2222222-2222-4222-8222-000000000001', 'a2222222-2222-4222-8222-222222222222', 'Hot Chocolate', 'drink', 0, 1),
  ('b2222222-2222-4222-8222-000000000002', 'a2222222-2222-4222-8222-222222222222', 'Oat Flat White', 'drink', 0, 2),
  ('b2222222-2222-4222-8222-000000000003', 'a2222222-2222-4222-8222-222222222222', 'House Pour-over', 'drink', 40, 3),
  ('b3333333-3333-4333-8333-000000000001', 'a3333333-3333-4333-8333-333333333333', 'Tasting Flight', 'drink', 0, 1),
  ('b3333333-3333-4333-8333-000000000002', 'a3333333-3333-4333-8333-333333333333', 'Iced Spanish Latte', 'drink', 0, 2)
on conflict (id) do nothing;

insert into public.freebie_kits (id, event_id, name, description, price, items, is_default, sort_order)
values
  (
    'c1111111-1111-4111-8111-000000000001',
    'a1111111-1111-4111-8111-111111111111',
    'Standard Kit',
    'Entry + 1 drink + core merch.',
    350,
    '["Cupholder","Sticker Pack"]'::jsonb,
    true,
    1
  ),
  (
    'c1111111-1111-4111-8111-000000000002',
    'a1111111-1111-4111-8111-111111111111',
    'Photocard Kit',
    'Adds a randomized photocard set for traders.',
    550,
    '["Cupholder","Photocard Set","Sticker Pack"]'::jsonb,
    false,
    2
  ),
  (
    'c1111111-1111-4111-8111-000000000003',
    'a1111111-1111-4111-8111-111111111111',
    'Full Wave Kit',
    'The complete table drop, including a mini poster.',
    850,
    '["Cupholder","Photocard Set","Poster","Sticker Pack"]'::jsonb,
    false,
    3
  ),
  (
    'c2222222-2222-4222-8222-000000000001',
    'a2222222-2222-4222-8222-222222222222',
    'Standing Ticket',
    'Floor space along the counter with one drink.',
    200,
    '["Setlist postcard"]'::jsonb,
    true,
    1
  ),
  (
    'c2222222-2222-4222-8222-000000000002',
    'a2222222-2222-4222-8222-222222222222',
    'Reserved Table',
    'Shared table seating closest to the performers.',
    350,
    '["Setlist postcard","Table candle"]'::jsonb,
    false,
    2
  ),
  (
    'c3333333-3333-4333-8333-000000000001',
    'a3333333-3333-4333-8333-333333333333',
    'Lab Seat',
    'Includes materials, tasting flight, and practice cups.',
    500,
    '["Practice cups","Tasting card","Recipe sheet"]'::jsonb,
    true,
    1
  )
on conflict (id) do nothing;
