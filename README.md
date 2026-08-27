# WAVspace

**WAVspace** (wordmark) / **WAV Space** (full title) is a cafe event reservation and venue booking template. It is built for local cafes that host cupsleeve events, acoustic nights, and workshops — with guest checkout, freebie kit selection, and manual receipt verification.

Demo tenant: **WAV Cafe**. Rebrand by editing `[lib/config/site-config.ts](lib/config/site-config.ts)`.

## How to Rebrand This Template

Use this repo as a white-label starting point for another cafe:

1. **Clone** this repository.
2. **Edit** `[lib/config/site-config.ts](lib/config/site-config.ts)`. That file is the only place you need to change for:
  - Cafe name, tagline, and description
  - Product wordmark (default `WAV` + `space`)
  - Accent / theme colors
  - GCash / Maya QR paths, bank, and e-wallet details
  - Contact info and social links (empty social URLs are hidden)
3. **Replace payment QR images** in `[public/payments/](public/payments/)` (`gcash.svg`, `maya.svg`), or point `payments.gcashQr` / `payments.mayaQr` at hosted URLs.
4. **Copy env vars:** `cp .env.example .env.local`. Set `RESEND_FROM_EMAIL` to the new cafe name (for example `"Your Cafe <onboarding@resend.dev>"`).
5. **Run the SQL migration** (schema only) in the Supabase SQL editor: `[supabase/migrations/20240827000001_init.sql](supabase/migrations/20240827000001_init.sql)`. `[supabase/seed.sql](supabase/seed.sql)` is optional WAV Cafe demo events — skip it for a live cafe, or update the `cafe_settings` row so live payment fields match your config.
6. **Create the admin user** (Authentication → disable public sign-ups, then create one email/password user). Deploy to Vercel with the same env vars and your production `NEXT_PUBLIC_SITE_URL`.

Chrome (navbar, footer, metadata, homepage, emails) always reads `site-config.ts`. Registration QR / bank details prefer the `cafe_settings` row in Supabase when one exists, and fall back to the config when it does not.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Lucide + Motion
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Resend for confirmation emails
- Vercel

Attendees never create accounts. They register with name + email, receive a `WAV-XXXX` code, and look up status at `/lookup`. Only cafe admins sign in.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The homepage still renders with demo events if Supabase env vars are empty. Live registration, lookup, and admin require a Supabase project.

### Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_EMAIL="WAV Cafe <onboarding@resend.dev>"
```



## Supabase

1. Create a project at [supabase.com](https://supabase.com). NbClxP7FVff1uTR8
2. In the SQL editor, run `[supabase/migrations/20240827000001_init.sql](supabase/migrations/20240827000001_init.sql)`.
3. Optionally run `[supabase/seed.sql](supabase/seed.sql)` for WAV Cafe demo events. Skip this (or edit the `cafe_settings` row) when deploying for another cafe.
4. Authentication → disable public sign-ups (staff-only). Create one user (email/password) for the cafe owner. A `profiles` row with `role = admin` is created automatically.
5. Storage bucket `payment-proofs` is created by the migration (private).

Or with the CLI:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
npx supabase db query --file supabase/seed.sql
```

Regenerate types later with:

```bash
npx supabase gen types typescript --project-id <id> > lib/types.ts
```



## Resend

Registration always shows the reference code on `/register/success`. When `RESEND_API_KEY` is set, attendees also get:

- “We received your registration” with the code and a lookup link
- Approve / reject notices after admin review
- A confirmation when a venue inquiry is submitted

Use `onboarding@resend.dev` until a domain is verified. Match `RESEND_FROM_EMAIL` to the cafe name in `site-config.ts`.

## Admin

- `/login` — cafe staff
- `/admin` — stats
- `/admin/registrations` — preview receipts, approve / reject (pending holds a slot)
- `/admin/events` — event builder (consumables + freebie kits)
- `/admin/venue-requests` — host inquiries



## Deploy on Vercel

1. Push this repo and import it in Vercel.
2. Add the same env vars (use the production site URL for `NEXT_PUBLIC_SITE_URL`).
3. Deploy. First load of `/` works even before seed data exists.



## Project map

```
app/                 routes + server actions
components/          homepage bento, wizard, admin
lib/config/          white-label site-config.ts
lib/                 supabase clients, types, email
emails/              Resend React templates
supabase/            SQL migration + seed
```

