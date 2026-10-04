import { Suspense, lazy, useEffect, useRef } from 'react';
import { matchPath, useRouter } from './lib/router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

// Code-split pages (later phases replace the ComingSoon placeholders)
const Home = lazy(() => import('./pages/Home.jsx'));
const ProductPlaceholder = lazy(() => import('./pages/ProductPlaceholder.jsx'));

const routes = [
  { path: '/', title: null, render: () => <Home /> },
  { path: '/shop', title: 'Shop', render: () => <ComingSoon title="Shop All Collections" accent="coming soon">Custom shoes, apparel and accessories made just for you. Filters, sorting and the full product grid arrive in the next phase.</ComingSoon> },
  { path: '/product/:slug', title: 'Product', render: (p) => <ProductPlaceholder slug={p.slug} /> },
  { path: '/custom-orders', title: 'Custom Orders', render: () => <ComingSoon title="Create Your Custom Order" accent="your vision">Your Vision. Our Creativity. One-of-a-Kind Designs. The step-by-step request form is on its way.</ComingSoon> },
  { path: '/gallery', title: 'Gallery', render: () => <ComingSoon title="Gallery" accent="past creations" /> },
  { path: '/about', title: 'About', render: () => <ComingSoon title="Meet Jessica" accent="our story" /> },
  { path: '/contact', title: 'Contact', render: () => <ComingSoon title="Contact" accent="say hello" /> },
  { path: '/faq', title: 'FAQ', render: () => <ComingSoon title="Frequently Asked Questions" accent="good to know" /> },
  { path: '/checkout', title: 'Checkout', render: () => <ComingSoon title="Checkout" accent="nearly yours">Secure checkout is built after the storefront and cart are finished. No payments are taken yet.</ComingSoon> },
  { path: '/account', title: 'Account', render: () => <ComingSoon title="Your Account" accent="welcome back" /> },
  { path: '/wishlist', title: 'Wishlist', render: () => <ComingSoon title="Your Wishlist" accent="saved for later" /> },
];

const BRAND = 'Jessica’s Customized Shoes & Accessories';

export default function App() {
  const { pathname } = useRouter();
  const mainRef = useRef(null);
  const first = useRef(true);

  let params = null;
  const route = routes.find((r) => (params = matchPath(r.path, pathname))) || null;

  useEffect(() => {
    document.title = route?.title ? `${route.title} | ${BRAND}` : route ? BRAND : `Page not found | ${BRAND}`;
    // Move focus to main content on navigation (not on first load) for screen readers
    if (first.current) { first.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, route]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          {route ? route.render(params) : (
            <ComingSoon title="Page not found" accent="oops">That page doesn’t exist. Let’s get you back to something sparkly.</ComingSoon>
          )}
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
