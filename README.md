# WAVspace

WAVspace is a **website template** for cafes that host events (cupsleeve / CSE nights, acoustic sets, workshops).

Guests pick an event, choose a drink and a freebie kit, send a payment screenshot, and get a booking code. They never create an account. Only cafe staff sign in, to approve receipts and manage events.

This repo ships as **WAV Cafe** so you can see how it looks. To use it for your own cafe, follow the walkthrough below. You do **not** share the original author’s database or email account — you create your own.

---

## How guests and staff use the site

**Guests**

1. Open the homepage and pick an event.
2. Enter name + email, choose a drink and kit, upload a GCash / Maya / bank receipt.
3. See a code like `WAV-1234` on the success page.
4. Check status later at **Lookup** with that code or the same email.

**Staff** (one login)

- `/login` — staff sign-in (forgot password is `/login/forgot`)
- `/admin` — overview
- `/admin/registrations` — open receipts, approve or reject
- `/admin/all-registrations` — every booking, any event or status
- `/admin/events` — create and edit events
- `/admin/venue-requests` — people who asked to host; approve/decline emails them
- `/admin/profile` — your name, password, and a typed **RESET** that wipes events and bookings (not your login)

Event links look like `/events/latte-art-lab`. Older UUID links still work.

---

## How to Rebrand This Template

Do these steps in order. You can test on your computer first; putting the site on the internet is the last section.

### 1. Copy the project

Clone or download this repository onto your computer (GitHub → **Code** → **Download ZIP**, or `git clone`).

Open the folder in Cursor or VS Code. In a terminal in that folder:

```bash
npm install
```

(You need [Node.js](https://nodejs.org) installed for this.)

### 2. Change the cafe name and look

Open [`lib/config/site-config.ts`](lib/config/site-config.ts). This is the **branding file**. Change the quoted text for:

- Cafe name, tagline, and description
- Product wordmark (the two pieces next to the logo, default `WAV` and `space`)
- Gold / accent color (`theme.gold`) and the hex colors used in emails and the favicon
- GCash / Maya QR paths, bank name, account name, account number
- Contact email, phone, address
- Instagram / Facebook / TikTok links (leave a link as `""` to hide it)

The rest of the page colors live in [`app/globals.css`](app/globals.css) if you want a deeper restyle.

The header, footer, page title, and emails always read this file. Payment QR and bank details on the checkout page use your live database row when it exists, and this file when it does not.

### 3. Put in your real payment QRs

Replace the placeholder files in [`public/payments/`](public/payments/):

- `gcash.svg` (or `.png` / `.jpg`)
- `maya.svg`

Or keep the filenames and change `payments.gcashQr` / `payments.mayaQr` in the branding file to full image URLs.

### 4. Create your own backend (Supabase)

Each cafe needs **their own** [Supabase](https://supabase.com) project (a hosted database + login). Do not reuse someone else’s keys.

1. Create a free project at supabase.com.
2. Open **SQL Editor**, paste the contents of [`supabase/migrations/20240827000001_init.sql`](supabase/migrations/20240827000001_init.sql), and run it.
3. Run the next files the same way: [`supabase/migrations/20240827000002_event_slugs_and_reset.sql`](supabase/migrations/20240827000002_event_slugs_and_reset.sql), then [`supabase/migrations/20240828000001_event_banners_and_lookup.sql`](supabase/migrations/20240828000001_event_banners_and_lookup.sql), then [`supabase/migrations/20240828000002_event_cancel_and_venue_link.sql`](supabase/migrations/20240828000002_event_cancel_and_venue_link.sql).
4. **Skip** [`supabase/seed.sql`](supabase/seed.sql) if this is a real cafe (that file is WAV Cafe sample events). Run it only if you want demo events to click through. If you do run it, you can later edit the `cafe_settings` row so bank / QR text matches your branding file.
5. **Authentication → Providers:** keep Email on. Turn **off** public sign-ups so random people cannot register as staff.
6. **Authentication → URL Configuration → Redirect URLs.** Add:
   - `http://localhost:3000/auth/callback` (for testing on your computer)
   - `https://YOUR-LIVE-SITE/auth/callback` (when the site is online — used for “forgot password”)
7. **Create the staff user after the SQL has run** (so the site can auto-create an admin profile):
   - Authentication → Users → **Add user**
   - Email + password for the cafe owner

The first SQL file also creates a private storage bucket named `payment-proofs` for receipt screenshots. The third file adds a public `event-banners` bucket and hides rejected codes from lookup. The fourth file adds cancellation fields and links a fan-hosted event back to its venue inquiry. You do not create those by hand.

If you created the Auth user **before** running the SQL, sign-in may bounce you back to login. In SQL Editor, run this (paste the user’s UUID from Authentication → Users):

```sql
insert into public.profiles (id, display_name, role)
values (
  'PASTE-USER-UUID-HERE',
  'Cafe owner',
  'admin'
)
on conflict (id) do update set role = 'admin';
```

### 5. Create your own email account (Resend)

Each cafe needs **their own** [Resend](https://resend.com) account. Guests’ confirmation emails do not go through the template author’s inbox.

**API key** = connects the website to Resend.  
**From address** = the name people see as the sender (not your login email).

1. Sign up at resend.com and create an API key with **Sending access**.
2. You cannot send “from” Gmail, Yahoo, or Outlook. Resend only allows an address on a domain you control.

**While you are testing (no domain yet)**

Keep:

```
RESEND_FROM_EMAIL="Your Cafe Name <onboarding@resend.dev>"
```

`onboarding@resend.dev` is Resend’s shared test sender. Mail will only arrive in the **email you used to sign up for Resend**. Checkout still works for any guest email — they still see `WAV-1234` on the success page — but other inboxes usually will not get the message.

**When you want every guest to receive mail**

1. Buy a domain you own (for example `yourcafe.com`).
2. In Resend: **Domains → Add Domain**, then add the DNS records they show at your domain host (Cloudflare, Namecheap, etc.).
3. Wait until the domain shows **Verified**.
4. Change the From line to something like `"Your Cafe Name <hello@yourcafe.com>"`.

The website URL and the email domain do not have to be the same. You can test the site on your computer and still send from `hello@yourcafe.com` once the domain is verified.

Emails the site can send (when the API key is set):

- “We received your registration” with the code, event details, kit, amount, and a Lookup link
- Approved / not approved after staff review, with the same booking recap (reject includes the reason and that the slot is released)
- Confirmation when someone submits “Host your event”, with a copy of the inquiry
- Approved / declined after staff review a venue inquiry, with next steps and cafe contact

If Resend is not set up, registration still succeeds. The code still shows on `/register/success`. Failed sends appear in the terminal as `Resend error` and in [resend.com/emails](https://resend.com/emails).

Guest booking codes stay in the form `WAV-XXXX`. That prefix lives in the database SQL, not the branding file. Changing it is optional and is a SQL change, not a rename in `site-config.ts`.

### 6. Put the secret keys on your computer

In the project folder, copy the example env file:

```bash
cp .env.example .env.local
```

On Windows PowerShell: `copy .env.example .env.local`

Open `.env.local` and fill in **your** values (Project Settings → API in Supabase; API Keys in Resend):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_EMAIL="Your Cafe Name <onboarding@resend.dev>"
```

- Never commit `.env.local` or paste those keys in a public chat. They are already ignored by git.
- After saving, restart the app (`Ctrl+C`, then `npm run dev` again).
- `NEXT_PUBLIC_SITE_URL` stays `http://localhost:3000` until the site is live. Then it must be your real website URL (so Lookup links inside emails are correct).

### 7. Run it locally and check the live path

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Sign in at `/login` with the staff user. You should land on `/admin`.
2. Create or edit an event if you skipped the demo seed.
3. Sign out. Register as a guest. For a full email test with `onboarding@resend.dev`, use **the same email as your Resend account**.
4. Confirm the success page shows a `WAV-XXXX` code.
5. Look it up at `/lookup`.
6. Sign back in, open `/admin/registrations`, approve the receipt. Lookup should show approved. If you used your Resend account email, you should also see the messages in that inbox (check spam) and at [resend.com/emails](https://resend.com/emails).

---

## Put the site on the internet (Vercel)

Do this when local testing works. `.env.local` stays on your computer — Vercel will not see it unless you paste the keys there.

1. Push the project to GitHub (do not include `.env.local`).
2. Import the repo in [Vercel](https://vercel.com).
3. Add the **same** environment variables. Set `NEXT_PUBLIC_SITE_URL` to your live URL (for example `https://yourcafe.vercel.app`).
4. In Supabase Redirect URLs, add `https://your-live-url/auth/callback`.
5. Deploy.

The homepage can load even before you add events. Live registration, lookup, and admin need the Supabase keys.

---

## Optional: command line instead of the SQL editor

If you use the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npx supabase db query --file supabase/seed.sql
```

Regenerate TypeScript types later with:

```bash
npx supabase gen types typescript --project-id <id> > lib/types.ts
```

---

## What the folders are (for developers)

```
app/                 pages and server actions
components/          homepage, checkout wizard, admin screens
lib/config/          branding file (site-config.ts)
lib/                 Supabase clients, types, email helpers
emails/              Resend email layouts
public/payments/     QR images
supabase/            SQL migrations and optional WAV Cafe seed
```

**Stack:** Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, Supabase, Resend, Vercel.
