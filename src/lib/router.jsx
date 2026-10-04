/**
 * Tiny dependency-free router (history API).
 * Netlify serves index.html for every path (see netlify.toml), so deep links work.
 * Swap for react-router later if the app outgrows this — the API mirrors it.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext(null);

const readLocation = () => ({
  pathname: window.location.pathname,
  search: window.location.search,
});

export function Router({ children }) {
  const [loc, setLoc] = useState(readLocation);

  useEffect(() => {
    const onPop = () => setLoc(readLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method](null, '', to);
    setLoc(readLocation());
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(
    () => ({ ...loc, query: new URLSearchParams(loc.search), navigate }),
    [loc, navigate]
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

/** matchPath('/product/:slug', '/product/abc') -> { slug: 'abc' } | null */
export function matchPath(pattern, pathname) {
  const p = pattern.split('/').filter(Boolean);
  const a = pathname.split('/').filter(Boolean);
  if (p.length !== a.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}

const isModified = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter();
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || isModified(e) || rest.target === '_blank') return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

export function NavLink({ to, end = false, className = '', ...rest }) {
  const { pathname } = useRouter();
  const path = to.split('?')[0];
  const active = end || path === '/' ? pathname === path : pathname.startsWith(path);
  return (
    <Link
      to={to}
      className={`${className} ${active ? 'is-active' : ''}`.trim()}
      aria-current={active ? 'page' : undefined}
      {...rest}
    />
  );
}
