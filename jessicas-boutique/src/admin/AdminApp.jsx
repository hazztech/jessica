import { useEffect, useState } from 'react';
import { Link, NavLink, matchPath, useRouter } from '../lib/router.jsx';
import { getSession, isAdmin, signInPreview, signOut, AUTH_PROVIDER } from '../services/auth.js';
import { listCustomRequests } from '../services/customRequests.js';
import { listOrders } from '../services/orders.js';
import { useLiveData } from './useLiveData.js';
import Logo from '../components/Logo.jsx';
import Button from '../components/Button.jsx';
import AdminOverview from './AdminOverview.jsx';
import AdminOrders from './AdminOrders.jsx';
import AdminOrderDetail from './AdminOrderDetail.jsx';
import AdminRequests from './AdminRequests.jsx';
import AdminRequestDetail from './AdminRequestDetail.jsx';
import AdminProducts from './AdminProducts.jsx';
import AdminProductEditor from './AdminProductEditor.jsx';
import AdminGallery from './AdminGallery.jsx';
import '../components/customization/Customization.css';
import './Admin.css';

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/orders', label: 'Orders', badge: 'orders' },
  { to: '/admin/requests', label: 'Custom Requests', badge: 'requests' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/coupons', label: 'Coupons', later: true },
  { to: '/admin/reviews', label: 'Reviews', later: true },
  { to: '/admin/customers', label: 'Customers', later: true },
];

/**
 * Admin area. The gate below hides the UI; real protection is server-side
 * (see services/auth.js and netlify/functions/_lib/requireAdmin.js).
 */
export default function AdminApp() {
  const [session, setSession] = useState(getSession);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!isAdmin(session)) return <SignIn onSignedIn={setSession} />;
  return <AdminShell session={session} onSignOut={() => { signOut(); setSession(null); }} />;
}

function SignIn({ onSignedIn }) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__card">
        <Logo linked={false} size="footer" />
        <h1>Admin sign-in</h1>
        {AUTH_PROVIDER === 'preview' ? (
          <>
            <p>
              Accounts are connected with the backend. Until then the dashboard runs in
              <strong> preview mode</strong>: everything you change is stored only in this browser.
            </p>
            <Button full onClick={async () => onSignedIn(await signInPreview())}>Continue in Preview Mode</Button>
          </>
        ) : (
          <p>Sign-in provider “{AUTH_PROVIDER}” is not configured yet.</p>
        )}
        <Link to="/" className="admin-gate__back">Back to the store</Link>
      </div>
    </div>
  );
}

function AdminShell({ session, onSignOut }) {
  const { pathname } = useRouter();
  const [requests] = useLiveData(() => listCustomRequests());
  const [orders] = useLiveData(() => listOrders());
  const badges = {
    requests: (requests || []).filter((r) => r.status === 'new').length,
    orders: (orders || []).filter((o) => o.status === 'new' || o.status === 'paid').length,
  };

  let page;
  let p;
  if (pathname === '/admin' || pathname === '/admin/') page = <AdminOverview />;
  else if (pathname === '/admin/orders') page = <AdminOrders />;
  else if ((p = matchPath('/admin/orders/:id', pathname))) page = <AdminOrderDetail key={p.id} orderNumber={p.id} />;
  else if (pathname === '/admin/requests') page = <AdminRequests />;
  else if ((p = matchPath('/admin/requests/:id', pathname))) page = <AdminRequestDetail key={p.id} requestId={p.id} />;
  else if (pathname === '/admin/products') page = <AdminProducts />;
  else if (pathname === '/admin/products/new') page = <AdminProductEditor key="new" />;
  else if ((p = matchPath('/admin/products/:id', pathname))) page = <AdminProductEditor key={p.id} productId={p.id} />;
  else if (pathname === '/admin/gallery') page = <AdminGallery />;
  else {
    const item = NAV.find((n) => n.to === pathname);
    page = (
      <div className="admin-page">
        <h1 className="admin-title">{item?.label || 'Page not found'}</h1>
        <div className="admin-panel admin-empty">
          <p>{item ? 'This section is coming in a later build phase.' : 'That admin page doesn’t exist.'}</p>
          <Link to="/admin">Go to overview</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand"><Logo linked={false} size="footer" /><span>Admin</span></div>
        <nav aria-label="Admin">
          <ul role="list" className="admin__nav">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={`admin__link ${n.later ? 'is-later' : ''}`}>
                  <span>{n.label}</span>
                  {n.badge && badges[n.badge] > 0 && (
                    <span className="admin__badge"><span aria-hidden="true">{badges[n.badge]}</span>
                      <span className="visually-hidden">{badges[n.badge]} need attention</span></span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="admin__foot">
          <Link to="/" className="admin__store">View store</Link>
          <button type="button" className="admin__signout" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>
      <main id="main" className="admin__main">
        {session.provider === 'preview' && (
          <p className="admin-preview" role="note">
            Preview mode — changes are saved in this browser only until the backend is connected.
          </p>
        )}
        {page}
      </main>
    </div>
  );
}
