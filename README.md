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
   - `NEXT_PUBLIC_SITE_URL` — set to your Vercel URL after the first deploy (e.g. `https://dom-panteron-universe.vercel.app`), or leave unset to use Vercel’s `VERCEL_URL` for emails/links
   - `NEXT_PUBLIC_APP_URL` — same as `NEXT_PUBLIC_SITE_URL` for auth redirects
   - Optional: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
4. Deploy. Each push to `main` triggers a new **Production** deploy; other branches/PRs get **Preview** URLs.
5. **Supabase Auth** — [Authentication → URL configuration](https://supabase.com/dashboard/project/jrdoyghmqyzfprldnvky/auth/url-configuration):
   - **Site URL:** your main Vercel URL
   - **Redirect URLs:** add `https://<your-project>.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

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

PayPal (`NEXT_PUBLIC_PAYPAL_CLIENT_ID`) is not wired yet — SumUp first.

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
