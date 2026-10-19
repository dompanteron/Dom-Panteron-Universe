# Dom Panteron Universe

New standalone Next.js project for the Dom Panteron brand.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

1. Copy `.env.example` to `.env.local`.
2. Fill in required values:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run:

```bash
npm run check:env
```

Use `.env.local` for local secrets and Vercel Project Environment Variables for deploys.

## Deploy to Vercel (preview / production)

1. Push this repo to GitHub (`dompanteron/Dom-Panteron-Universe`).
2. In [Vercel](https://vercel.com/new), **Import** that repository (framework: Next.js, default build settings).
3. **Environment variables** — add the same keys as `.env.local` for **Preview** and **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` — your live URL (e.g. `https://dom-panteron-universe-p1.vercel.app`), **or leave unset** on Vercel so links/OG use `VERCEL_URL` automatically. Do **not** set `localhost` in Production.
   - `NEXT_PUBLIC_APP_URL` — same as `NEXT_PUBLIC_SITE_URL` for auth redirects
   - Optional: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
4. Deploy. Each push to `main` triggers a new **Production** deploy; other branches/PRs get **Preview** URLs.
5. **Supabase Auth** — [Authentication → URL configuration](https://supabase.com/dashboard/project/jrdoyghmqyzfprldnvky/auth/url-configuration):
   - **Site URL:** your main Vercel URL
   - **Redirect URLs:** add `https://<your-project>.vercel.app/auth/callback` and `http://localhost:3000/auth/callback` (password reset emails use the same callback → `/join/reset`)

## Custom domain (optional)

1. **Vercel** — Project → **Settings → Domains** → add your domain (e.g. `dompanteron.com` and `www`). Follow DNS instructions until the domain shows **Valid**.
2. **Environment variables** (Production, and Preview if you use previews on that hostname):
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com` (no trailing slash)
   - `NEXT_PUBLIC_APP_URL` = same value
3. **Redeploy** production after changing env vars.
4. **Supabase Auth** — update **Site URL** and add redirect:
   - `https://your-domain.com/auth/callback`
   - Keep `http://localhost:3000/auth/callback` for local dev
5. **SumUp webhook** (if used) — point to `https://your-domain.com/api/webhooks/sumup`
6. **Resend** — if your sending domain is verified there, keep `RESEND_FROM_EMAIL` aligned with that domain.

CLI alternative (after `npx vercel login`):

```bash
npx vercel link
npx vercel env pull .env.vercel.local   # optional
npx vercel --prod                        # production
npx vercel                               # preview
```

## Supabase CLI (when starting database phases)

```bash
supabase login
supabase init
supabase link --project-ref jrdoyghmqyzfprldnvky
```

## Shop images (Supabase Storage)

Migration `20251017200000_shop_storage.sql` creates public bucket **`shop`**. Admins upload in **Admin → Collections / Products** (max 5 MB, JPEG/PNG/WebP/GIF).

Apply with `npx supabase db push` if not already applied.

## Shop payments (SumUp)

When both are set in `.env.local` / Vercel, product checkout uses **SumUp Hosted Checkout** (card). If either is missing, orders stay **manual** (pending until admin marks paid).

- `SUMUP_API_KEY` — SumUp developer/API key
- `SUMUP_MERCHANT_CODE` — merchant code from SumUp dashboard

After deploy, register webhook URL in SumUp (optional but recommended):

`https://YOUR-VERCEL-URL/api/webhooks/sumup`

Apply migration `20251017120000_product_orders_sumup.sql` (`npx supabase db push`).

**Test:** use a small amount; SumUp sandbox treats amount **11** as always failing (CocoHawaii convention).

Raffle entries use the same SumUp keys when configured (`POST /api/raffles/[id]/enter` → hosted checkout → entries recorded on payment).

## PayPal (shop + raffles)

When **both** are set (and SumUp is optional), checkout can use **PayPal redirect + capture**:

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — REST app client ID (sandbox or live)
- `PAYPAL_CLIENT_SECRET` — secret for the same app (server only, never expose in the browser)
- Optional `PAYPAL_ENV` — `sandbox` or `live` (otherwise inferred from the client id)

If **SumUp and PayPal** are both configured, the buyer chooses **Card (SumUp)** or **PayPal** on product and raffle checkout. If only one is set, that provider is used automatically.

Apply migration `20251017230000_paypal_order_ids.sql` (`npx supabase db push`).

**Sandbox:** create app at [PayPal Developer](https://developer.paypal.com/) and use sandbox business + personal test accounts.

**Webhook (recommended):** In PayPal Developer → your app → **Webhooks**, add:

`https://YOUR-SITE-URL/api/webhooks/paypal`

Subscribe at least to **Checkout order approved** and **Payment capture completed**. Copy the **Webhook ID** into `PAYPAL_WEBHOOK_ID` on Vercel. If the buyer closes the browser before the return page runs, PayPal can still trigger capture and mark shop orders / raffle entries paid.

Local dev without `PAYPAL_WEBHOOK_ID` skips signature verification (production should always set it).

## Database migrations

This repo includes SQL migrations in `supabase/migrations`.

Choose one method:

1. Direct Postgres connection via Node script:

```bash
npm run db:migrate
```

2. Supabase CLI method:

```bash
supabase db push
```
