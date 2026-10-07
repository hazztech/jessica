/**
 * Admin authentication.
 *
 * ⚠️  Anything in the browser can be inspected, so the front end can only HIDE
 * admin screens. What actually keeps data private is the server: every admin
 * API (Netlify Function) must verify a signed-in user with the `admin` role
 * before reading or writing anything. See netlify/functions/_lib/requireAdmin.js.
 *
 * Providers:
 *   'preview' — current build. No backend, so no real accounts; data lives only
 *               in this browser. Session lasts until the tab closes.
 *   Plug in a real provider (Supabase Auth, Auth0, Clerk…) by implementing
 *   signIn / signOut / getSession below with the same shapes.
 */
const KEY = 'jcsa-admin-session';
export const AUTH_PROVIDER = import.meta.env?.VITE_AUTH_PROVIDER || 'preview';

export function getSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (!s || s.expiresAt < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export async function signInPreview() {
  const session = { user: { email: 'preview', role: 'admin' }, provider: 'preview', expiresAt: Date.now() + 8 * 3600e3 };
  sessionStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  sessionStorage.removeItem(KEY);
}

export const isAdmin = (session) => session?.user?.role === 'admin';
