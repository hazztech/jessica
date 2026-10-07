import { Suspense, lazy, useEffect, useRef } from 'react';
import { matchPath, useRouter } from './lib/router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

// Code-split pages (later phases replace the ComingSoon placeholders)
const Home = lazy(() => import('./pages/Home.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const GalleryPage = lazy(() => import('./pages/GalleryPage.jsx'));
const ShopPage = lazy(() => import('./pages/ShopPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'));
const CustomOrderPage = lazy(() => import('./pages/CustomOrderPage.jsx'));
const CustomOrderSuccess = lazy(() => import('./pages/CustomOrderSuccess.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx')); // separate bundle — shoppers never download it

const routes = [
  { path: '/', title: null, render: () => <Home /> },
  { path: '/shop', title: 'Shop', render: (p, search) => <ShopPage key="shop" /> },
  { path: '/product/:slug', title: 'Product', render: (p, search) => <ProductPage key={p.slug + search} slug={p.slug} /> },
  { path: '/custom-orders', title: 'Custom Orders', render: () => <CustomOrderPage /> },
  { path: '/custom-orders/success', title: 'Request Received', render: () => <CustomOrderSuccess /> },
  { path: '/gallery', title: 'Gallery', render: () => <GalleryPage /> },
  { path: '/about', title: 'About', render: () => <ComingSoon title="Meet Jessica" accent="our story" /> },
  { path: '/contact', title: 'Contact', render: () => <ComingSoon title="Contact" accent="say hello" /> },
  { path: '/faq', title: 'FAQ', render: () => <ComingSoon title="Frequently Asked Questions" accent="good to know" /> },
  { path: '/checkout', title: 'Checkout', render: () => <CheckoutPage /> },
  { path: '/checkout/confirmation', title: 'Order Confirmed', render: () => <OrderConfirmation /> },
  { path: '/account', title: 'Account', render: () => <ComingSoon title="Your Account" accent="welcome back" /> },
  { path: '/wishlist', title: 'Wishlist', render: () => <ComingSoon title="Your Wishlist" accent="saved for later" /> },
];

const BRAND = 'Jessica’s Customized Shoes & Accessories';

export default function App() {
  const { pathname, search } = useRouter();
  const mainRef = useRef(null);
  const first = useRef(true);

  let params = null;
  const route = routes.find((r) => (params = matchPath(r.path, pathname))) || null;

  useEffect(() => {
    document.title = pathname.startsWith('/admin') ? `Admin | ${BRAND}` : route?.title ? `${route.title} | ${BRAND}` : route ? BRAND : `Page not found | ${BRAND}`;
    // Move focus to main content on navigation (not on first load) for screen readers
    if (first.current) { first.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, route]);

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
        <a href="#main" className="skip-link">Skip to content</a>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          {route ? route.render(params, search) : (
            <ComingSoon title="Page not found" accent="oops">That page doesn’t exist. Let’s get you back to something sparkly.</ComingSoon>
          )}
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
