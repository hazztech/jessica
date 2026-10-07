# Jessica's Customized Shoes & Accessories — Storefront

React + Vite, mobile-first, deploys to Netlify. Built with sample data; no live payments.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to /dist
```

## Deploy to Netlify

Push to GitHub and import the repo in Netlify — `netlify.toml` already sets the build
command (`npm run build`), publish folder (`dist`), SPA redirects and security headers.
Or drag the `dist` folder into Netlify Drop after `npm run build`.

## The logo (do not change)

`public/brand/logo.png` is the official approved logo exactly as supplied.
`logo-240/480/960.webp` are the same image, only resized for fast loading.
`favicon-64.png` and `apple-touch-icon.png` place the full logo on a white square.
All logo rendering goes through `src/components/Logo.jsx`.

## Build phases

| # | Phase | Status |
|---|-------|--------|
| 1 | Global design system | Done — `src/styles/tokens.css`, `base.css` |
| 2 | Header | Done — sticky, search, account, wishlist, cart count, mobile menu |
| 3 | Homepage | Done — hero, values, collections, featured, callout, how it works, testimonials |
| 4 | Shop | Done — filters (category, price slider, color, size, occasion), sort, URL-shareable; mobile Filter & Sort sheet |
| 5 | Product detail + dynamic customization | Done — schema-driven customizer, live pricing, gallery, edit-in-cart |
| 6 | Cart | Done — customized lines, inline add-on prices, edit, quantity, remove |
| 7 | Custom order requests | Done — 6-step wizard, review, JCSA-XXXXX numbers, success screen, admin inbox |
| 14 | Admin dashboard | Done (UI) — overview, orders, custom requests, products, gallery; server auth at backend phase |
| 12 | Checkout | Done (preview) — one column, autofill-ready, shipping methods, discount code, totals; Stripe not connected |
| 8 | Gallery | Done — masonry, category filters, lightbox, “Ask Jessica To Create Something Similar” |
| 9–11, 13 | About, Contact, FAQ, Account | Placeholders |

## Project structure

```
src/
  styles/        tokens.css (colors, type, spacing), base.css
  lib/           router.jsx (tiny router), format.js, storage.js, useDialog.js
  context/       CartContext, WishlistContext, ToastContext
  data/          categories.js, products.js, site.js   ← SAMPLE data, admin-managed later
  components/    Header, Navigation, MobileNav, SearchModal, Hero, ValueStrip,
                 CategoryCard, ProductCard, ProductImage, CategoryIcon, Button,
                 Modal, CartDrawer, Toast, CustomOrderCallout, HowItWorks,
                 Testimonials, Footer, Logo, icons
  pages/         Home, ComingSoon (temporary), ProductPlaceholder
```

## Product customization

One product page renders every category from configuration — there are no per-category pages.

- `src/data/customizationSchemas.js` — the field library and one schema per category
  (shoes, outfits, shirts, ties, tumblers, socks, hats, jackets). Field types: `choice`,
  `swatch`, `select`, `text`, `number`, `date`, `textarea`, `upload`, `toggle`.
  Options can carry a `price`; text, date, toggle and upload fields can carry a flat `price`.
  `optionsBy` swaps options from another answer (adult vs youth sizes); `showWhen` reveals
  a field conditionally (artwork upload appears only for “My own artwork”).
- `src/lib/customization.js` — the engine: `resolveSchema` (category schema + product
  settings), `validate`, `computePrice`, `buildCartLine`.
- **Per-product settings** (the future admin controls) live on each product:

```js
customization: {
  disabledFields: ['dressSize'],                    // hide a field
  disabledOptions: { tieStyle: ['clip-on'] },       // hide individual options
  priceOverrides: { name: 12, 'rhinestones.full': 50 }, // field or field.option
  fieldOverrides: { name: { maxLength: 12, label: 'Name on heel' } },
}
```

  The sample Custom Tutu Outfit Set hides dress size and charges $12 for a name;
  the Rhinestone Custom Tie hides clip-on.
- **Cart lines** store the raw selections, a readable summary, every charge and a
  signature. Identical configurations merge; different ones stay separate lines.
  “Edit” reopens the product page pre-filled and updates that line in place.
- **Uploads** are validated (type, size, count) and kept in memory only
  (`src/lib/uploadStore.js`). The cart stores file metadata, never the files. At checkout
  they go to cloud storage, and the order keeps the URL, name, type, size and date.

## Custom order requests (`/custom-orders`)

Different from customizing a shop product: the customer asks Jessica to create something
from scratch and gets a quote, so nothing in the request is priced.

- **Wizard:** Item Type → Your Vision → Upload Inspiration (up to 10 images) → Custom Details →
  Budget & Timeline → Contact → Review → Submit. Each step validates before moving on;
  completed steps can be revisited from the stepper or the review page's Edit buttons.
  Progress (except files) is saved, so a refresh doesn't lose work.
- **Step 4 questions** come from the same category schemas as product customization
  (`requestDetailFields()` in `src/data/customRequestForm.js` strips prices, uploads and notes).
  Choosing two item types shows both sets of questions.
- `/custom-orders?type=shoes` pre-selects an item type (useful for “Ask Jessica to create
  something similar” links from the gallery).
- **Success:** `/custom-orders/success?ref=JCSA-12345`.
- **Service layer:** `src/services/customRequests.js` — `submitCustomRequest`, `listCustomRequests`,
  `getCustomRequest`, `updateCustomRequest`. In this front-end build requests are saved in the
  browser's localStorage so the flow can be tested end-to-end. For launch, replace the function
  bodies with calls to a Netlify Function that re-validates, uploads files to cloud storage,
  generates the request number server-side, saves to the database and emails Jessica.
  The UI won't need changes.

## Admin (`/admin`)

Separate code bundle (shoppers never download it), hidden from search engines
(`robots.txt`, `noindex` meta and `X-Robots-Tag` header).

- **Overview** — Today's Orders, Pending Orders, Custom Requests, Requests Awaiting Quote,
  Orders In Production, Revenue (paid, last 30 days), Low Inventory; plus new requests and
  orders needing attention. Every card links to the matching filtered list.
- **Orders** — tabs for every status (New, Paid, Processing, In Production, Finishing Touches,
  Ready, Shipped, Delivered, Cancelled), search, detail view with items and their customizations,
  a one-tap “Mark as next status” button, tracking number (required to ship), notes and history.
  Checkout isn't live yet, so the preview includes **sample orders** — remove them with
  “Remove sample orders”.
- **Custom Requests** — table with Request Number, Customer, Item Type, Date, Budget,
  Requested Date, Status, Quote and Actions. The detail view shows inspiration images and lets
  Jessica email / text / call, record a quote and deposit, add notes, **Mark quote sent**,
  **Approve request** (requires a quote) and **Move into production**.
- **Products** — add, edit, archive/restore, delete (with confirmation); upload and reorder photos
  with descriptions; category; price and sale price; inventory or made-to-order with a low-stock
  alert level; customizable on/off; per-product customization (turn options on/off, override any
  price, add **add-ons** and custom **option lists**); production time; visibility and featured.
  Changes appear in the storefront immediately.
- **Gallery** — upload finished pieces (up to 6 photos each), assign one of the eight categories,
  title, description, publish/hide, feature.

### Keeping admin private — read before launch

Code that runs in the browser can always be inspected, so the sign-in screen only *hides*
admin pages. Real protection comes from the server:

1. Add a real sign-in provider (Supabase Auth, Auth0, Clerk…) in `src/services/auth.js`.
2. Move every admin read/write into Netlify Functions and start each one with
   `requireAdmin()` from `netlify/functions/_lib/requireAdmin.js` (fails closed until configured).
3. Optionally add the commented Basic-Auth header in `netlify.toml` as an extra lock on `/admin`.

Until then the dashboard runs in **preview mode**: data lives only in the browser it was
entered in, and nothing is shared with customers or other devices.

## Mobile

Tested at 375, 390, 430 and 768px wide: no horizontal scrolling on any page, and every
button, chip and input is at least 44px tall.

- **Header:** the same official logo at a compact size, hamburger menu, search and cart
  always visible.
- **Home:** hero stacks (text, then the arched display) on phones and sits side by side from
  720px; categories and products are two columns on phones.
- **Shop:** the sidebar is hidden below 1024px. A sticky **Filter & Sort** button opens a
  bottom sheet with a live "Show N results" button; active filters show as removable chips.
- **Product page:** gallery first (swipeable with dots when there are several photos), then
  info, then full-width options. The sticky **Add To Cart** bar slides up only after every
  required option is chosen, and hides while the in-page button is on screen.
- **Custom order:** "Step 2 of 6" with a progress bar on phones (full stepper from 760px);
  Back / Continue stay pinned to the bottom.
- **Uploads:** "Photo library" (multi-select) and "Take photo" (camera) buttons on touch
  devices; iPhone HEIC photos accepted; 15 MB per image for custom requests.
- **Forms:** email / tel / numeric keyboards, `autocomplete` tokens for one-tap autofill,
  "next / done" keyboard keys, 16px inputs (no iOS zoom).
- **Checkout:** single column with a collapsible order summary and a sticky Place Order bar.

## Checkout (`/checkout`)

Preview mode — **no payment is taken**. Placing an order records it as *unpaid* in
Admin → Orders and shows the confirmation page. `SPARKLE10` is a SAMPLE discount code
(10% off) in `src/services/coupons.js`; remove it before launch. Tax shown is an estimate
(8.25% placeholder) until Stripe Tax is connected. See `src/services/checkout.js` for the
Stripe integration plan: server-side re-pricing, Stripe Checkout/PaymentIntent with the
secret key in Netlify env vars, and a webhook that marks orders paid.

## Product photography

17 photos of Jessica's work live in `public/images/products/` as WebP (full size + 600px),
referenced through `src/data/photos.js`. They're used for:

- **Products** — `src/data/seedProducts.js` (17 photographed products + socks and jacket,
  which still show studio renders until photos exist). Prices are placeholders.
- **Categories** — Shoes, Outfits, Shirts, Ties, Tumblers and Hats (the Hats image is a crop
  of the beanie from the beanie-and-tie photo).
- **Homepage hero** — arched main photo plus Outfits / Ties / Tumblers cards (`heroPhotos`
  in `src/data/site.js`; set it to `null` to return to the illustrated flat-lay).
- **Gallery** — `src/data/seedGallery.js`, managed in Admin → Gallery.

Storage keys were bumped (`jcsa-catalog-v2`, `jcsa-gallery-v2`, `jcsa-orders-v2`) so
browsers that loaded the earlier samples pick up the new catalog.

**Adding photos:** export at ~1200px wide → save `<name>.webp` and `<name>-600.webp` in
`public/images/products/`, add the size to `photos.js`, then reference `photo('<name>', 'description')`.
Photos uploaded in Admin are resized automatically.

**Before launch — licensing:** several pieces show licensed characters, luxury-brand logos,
sorority marks or a celebrity likeness. Selling those without permission can lead to
takedowns, and payment processors (including Stripe) prohibit counterfeit or infringing
goods, which can freeze an account. Product names and descriptions here are written
brand-neutral; review which photos to keep live and confirm licensing where needed.

## Replacing placeholders

- **Hero photo:** set `heroImage` in `src/data/site.js` to a styled 4:5 photo of several
  products. Until then the hero shows the built-in flat-lay of all eight categories.
- **Photos:** add `images: [{ url, alt, width, height }]` to a product in `src/data/products.js`
  (or `image` on a category). Cards switch from placeholder art to the photo automatically,
  lazy-loaded. Use WebP/AVIF around 1200px wide.
- **Testimonials:** `src/data/site.js` contains SAMPLE quotes — replace with real reviews before launch.
- **Prices and add-ons:** placeholders in `products.js`; these move to the admin dashboard later.

## Design system notes

- White dominant; teal `#067A70` for buttons (passes WCAG AA with white text), mint `#4FCDBB`
  for accents and glows only (too light for text), silver for borders.
- Type: Bodoni Moda (headings), DM Sans (body), Pinyon Script (short accents only).
- Signature details: the **arched silver frame** (from the logo's heart) in the hero, and a
  **silver divider with a small crystal heart** under every section heading (`Ornament.jsx`).
- Script type is reserved for the hero ("Imagination") and the custom-order panel.
- Placeholder product images are studio-style renders (`ProductArt.jsx`) on a white-to-mint
  backdrop. Shoot real photos the same way (white or pale mint, soft light) so the grid stays consistent.
- All motion respects `prefers-reduced-motion`.

## Security

Only `VITE_`-prefixed variables reach the browser. Stripe secret keys and database admin keys
belong in Netlify environment variables and serverless functions — see `.env.example`.
