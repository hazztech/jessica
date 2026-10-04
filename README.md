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
| 4 | Shop | Next — route shows a placeholder |
| 5 | Product detail + dynamic customization | Placeholder |
| 6 | Cart | Drawer working (add, quantity, remove, subtotal); full edit flow in phase 5/6 |
| 7–14 | Custom order form, Gallery, About, Contact, FAQ, Checkout, Account, Admin | Placeholders |

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

## Replacing placeholders

- **Photos:** add `images: [{ url, alt, width, height }]` to a product in `src/data/products.js`
  (or `image` on a category). Cards switch from placeholder art to the photo automatically,
  lazy-loaded. Use WebP/AVIF around 1200px wide.
- **Testimonials:** `src/data/site.js` contains SAMPLE quotes — replace with real reviews before launch.
- **Prices and add-ons:** placeholders in `products.js`; these move to the admin dashboard later.

## Design system notes

- White dominant; teal `#067A70` for buttons (passes WCAG AA with white text), mint `#4FCDBB`
  for accents and glows only (too light for text), silver for borders.
- Type: Bodoni Moda (headings), DM Sans (body), Pinyon Script (short accents only).
- Signature motif: the **arch**, taken from the logo's rhinestone heart frame — used for the
  hero display case, category cards and empty states.
- All motion respects `prefers-reduced-motion`.

## Security

Only `VITE_`-prefixed variables reach the browser. Stripe secret keys and database admin keys
belong in Netlify environment variables and serverless functions — see `.env.example`.
