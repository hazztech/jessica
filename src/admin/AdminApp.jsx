import { useEffect, useState } from 'react';
import { Link, NavLink, matchPath, useRouter } from '../lib/router.jsx';
import { AUTH_PROVIDER, isAdmin, loadSession, onAuthChange, sendPasswordReset, signIn, signInPreview, signOut, updatePassword } from '../services/auth.js';
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
  const [session, setSession] = useState(undefined); // undefined = checking
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let live = true;
    loadSession().then((s) => live && setSession(s));
    const unsub = onAuthChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setSession(null);
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') loadSession().then((s) => live && setSession(s));
    });
    return () => { live = false; unsub(); };
  }, []);

  if (session === undefined) return <div className="admin-gate" aria-busy="true" />;
  if (recovery) return <SetPassword onDone={async () => { setRecovery(false); setSession(await loadSession()); }} />;
  if (!isAdmin(session)) return <SignIn onSignedIn={setSession} signedInAs={session?.user?.email} />;
  return <AdminShell session={session} onSignOut={async () => { await signOut(); setSession(null); }} />;
}

function GateCard({ title, children }) {
  return (
    <div className="admin-gate">
      <div className="admin-gate__card">
        <Logo linked={false} size="footer" />
        <h1>{title}</h1>
        {children}
        <Link to="/" className="admin-gate__back">Back to the store</Link>
      </div>
    </div>
  );
}

function SignIn({ onSignedIn, signedInAs }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // signin | reset | sent
  const [error, setError] = useState(signedInAs ? `${signedInAs} doesn’t have admin access.` : '');
  const [busy, setBusy] = useState(false);

  if (AUTH_PROVIDER === 'preview') {
    return (
      <GateCard title="Admin sign-in">
        <p>
          Accounts are connected with the backend. Until then the dashboard runs in
          <strong> preview mode</strong>: everything you change is stored only in this browser.
        </p>
        <Button full onClick={async () => onSignedIn(await signInPreview())}>Continue in Preview Mode</Button>
      </GateCard>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'reset') { await sendPasswordReset(email); setMode('sent'); }
      else onSignedIn(await signIn(email, password));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  if (mode === 'sent') {
    return (
      <GateCard title="Check your email">
        <p>If <strong>{email}</strong> has an account, a link to set a new password is on its way.</p>
        <Button full variant="secondary" onClick={() => setMode('signin')}>Back to sign in</Button>
      </GateCard>
    );
  }

  return (
    <GateCard title={mode === 'reset' ? 'Reset your password' : 'Admin sign-in'}>
      <form className="admin-signin" onSubmit={submit} noValidate>
        <label className="cz-label" htmlFor="ad-email">Email</label>
        <input id="ad-email" className="cz-input" type="email" inputMode="email" autoComplete="username" required
          value={email} onChange={(e) => setEmail(e.target.value)} enterKeyHint={mode === 'reset' ? 'send' : 'next'} />
        {mode === 'signin' && (
          <>
            <label className="cz-label" htmlFor="ad-pass">Password</label>
            <input id="ad-pass" className="cz-input" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)} enterKeyHint="go" />
          </>
        )}
        {error && <p className="cz-error" role="alert">{error}</p>}
        <Button type="submit" full disabled={busy || !email || (mode === 'signin' && !password)}>
          {busy ? 'Please wait…' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
        </Button>
        <button type="button" className="admin-signin__alt" onClick={() => { setError(''); setMode(mode === 'reset' ? 'signin' : 'reset'); }}>
          {mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}
        </button>
      </form>
    </GateCard>
  );
}

function SetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 10) { setError('Use at least 10 characters.'); return; }
    setBusy(true);
    try { await updatePassword(password); onDone(); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <GateCard title="Set a new password">
      <form className="admin-signin" onSubmit={submit} noValidate>
        <label className="cz-label" htmlFor="ad-new">New password</label>
        <input id="ad-new" className="cz-input" type="password" autoComplete="new-password" minLength={10}
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="cz-error" role="alert">{error}</p>}
        <Button type="submit" full disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button>
      </form>
    </GateCard>
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
        {session.provider === 'supabase' && (
          <p className="admin-who">Signed in as {session.user.email}</p>
        )}
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
