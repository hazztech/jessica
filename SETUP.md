# Going live: Supabase + Netlify setup

About 15 minutes. You'll need a Supabase account and the Netlify site you already use.
Nothing here touches payments — those stay off until you choose to turn them on.

---

## 1. Create the Supabase project

1. Go to **supabase.com → New project**. Pick a region near your customers (e.g. *East US*).
   Save the database password somewhere safe.
2. When it finishes, open **SQL Editor → New query**.
3. Paste all of `supabase/migrations/20261007000000_initial_schema.sql` → **Run**.
   This creates every table, the security rules and the three storage buckets.
4. New query → paste all of `supabase/seed.sql` → **Run**.
   This loads the 8 categories, 19 products and 17 gallery pieces.

## 2. Create Jessica's admin login

1. **Authentication → Users → Add user → Create new user**
   Enter Jessica's email and a strong password, and tick **Auto Confirm User**.
2. SQL Editor → run (with her email):
   ```sql
   update public.profiles set role = 'admin' where email = 'jessica@yourdomain.com';
   ```
3. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up".
   Customers don't need accounts yet, so nobody else should be able to create one.
4. **Authentication → URL Configuration**: set **Site URL** to your live site
   (e.g. `https://jessicascustomized.com`) and add `https://YOUR-SITE/admin` to **Redirect URLs**
   (used by "Forgot password?").

## 3. Check the security setup

SQL Editor → run `supabase/verify.sql`. Expected results are written above each query —
most importantly, query 1 must return **no rows** and `customer-uploads` must be `public = false`.

## 4. Connect Netlify

**Supabase → Project Settings → API** has the values you need.

In **Netlify → Site configuration → Environment variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL | Public |
| `VITE_SUPABASE_ANON_KEY` | `anon` / publishable key | Public — the database rules protect data |
| `SUPABASE_URL` | Project URL | Used by server functions |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` / secret key | **Secret.** Never add a `VITE_` prefix |
| `UPLOAD_SIGNING_SECRET` | any long random string | e.g. generate at 1password.com/password-generator |
| `SITE_URL` | `https://YOUR-SITE` | Used in emails and payment redirects |
| `PAYMENTS_ENABLED` | `false` | Keep false for now |

Then **Deploys → Trigger deploy → Clear cache and deploy site**.
(`VITE_` values are baked in at build time, so redeploy whenever you change them.)

## 5. Try it

- Home and Shop load products from the database.
- Submit a test custom request with a photo → it appears in **/admin → Custom Requests**.
- Place a test order → it appears in **/admin → Orders** marked *preview — no payment taken*.
- Add a product with a photo in **/admin → Products** → it shows in the shop.

---

## Optional: email notifications (Resend)

1. Create an account at **resend.com**, verify your domain, create an API key.
2. Add to Netlify: `RESEND_API_KEY`, `EMAIL_FROM` (e.g. `Jessica's <orders@yourdomain.com>`),
   `NOTIFY_EMAIL` (where Jessica gets alerts). Redeploy.

Customers then get a confirmation for custom requests and paid orders, and Jessica gets alerts.
Without these variables everything still works — emails are simply skipped.

## Later: turning on payments (Stripe)

Only when the shop is ready to take real money:

1. Stripe Dashboard → **Developers → API keys** → copy the secret key → Netlify `STRIPE_SECRET_KEY`.
2. **Developers → Webhooks → Add endpoint**: `https://YOUR-SITE/api/stripe-webhook`,
   events `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
   Copy the signing secret → Netlify `STRIPE_WEBHOOK_SECRET`.
3. Set `PAYMENTS_ENABLED=true` and redeploy. Test with Stripe's test keys first.

Checkout then sends customers to Stripe's secure payment page. When payment succeeds, the
webhook marks the order paid, reduces stock and counts the coupon use.

## Coupons

Until the admin coupon screen is built, add codes in **Supabase → Table Editor → coupons**:
`code` (UPPERCASE), `type` (`percent` or `fixed`), `value`, `active`, and optionally
`starts_at`, `ends_at`, `max_uses`, `min_subtotal`.

## Local development with the backend

```bash
npm install
cp .env.example .env          # fill in the values from step 4
npx netlify-cli@latest dev    # runs the site + functions together at http://localhost:8888
```
`npm run dev` alone runs the site without functions (fine for design work; with no Supabase
keys it uses preview mode).

## If you edit the sample catalog in code

`npm run seed:generate` rebuilds `supabase/seed.sql`. It only inserts missing rows, so it
never overwrites products Jessica has edited in the admin.
