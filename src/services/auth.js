/**
 * Admin authentication.
 *   Live:    Supabase Auth (email + password). An account is an admin when its
 *            row in `profiles` has role = 'admin'. The DATABASE enforces this with
 *            Row Level Security, so hiding screens is only a convenience.
 *   Preview: no accounts; a session flag lets you explore the dashboard locally.
 */
import { BACKEND, supabase } from '../lib/backend.js';

const KEY = 'jcsa-admin-session';
export const AUTH_PROVIDER = BACKEND ? 'supabase' : 'preview';
export const isAdmin = (session) => session?.user?.role === 'admin';

/* ---------- preview ---------- */
function previewSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    return s && s.expiresAt > Date.now() ? s : null;
  } catch {
    return null;
  }
}
export async function signInPreview() {
  const session = { user: { email: 'preview', role: 'admin' }, provider: 'preview', expiresAt: Date.now() + 8 * 3600e3 };
  sessionStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

/* ---------- shared API ---------- */
export async function loadSession() {
  if (!BACKEND) return previewSession();
  const sb = await supabase();
  const { data } = await sb.auth.getSession();
  const s = data?.session;
  if (!s) return null;
  const { data: profile } = await sb.from('profiles').select('role, full_name').eq('id', s.user.id).maybeSingle();
  return {
    provider: 'supabase',
    accessToken: s.access_token,
    user: { id: s.user.id, email: s.user.email, name: profile?.full_name || '', role: profile?.role || 'customer' },
  };
}

export async function signIn(email, password) {
  const sb = await supabase();
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : error.message);
  const session = await loadSession();
  if (!isAdmin(session)) {
    await sb.auth.signOut();
    throw new Error('This account doesn’t have admin access.');
  }
  return session;
}

export async function sendPasswordReset(email) {
  const sb = await supabase();
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password) {
  const sb = await supabase();
  const { error } = await sb.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

/** Subscribe to auth events (SIGNED_IN, SIGNED_OUT, PASSWORD_RECOVERY, …). Returns an unsubscribe function. */
export function onAuthChange(callback) {
  if (!BACKEND) return () => {};
  let unsub = () => {};
  supabase().then((sb) => {
    const { data } = sb.auth.onAuthStateChange((event) => callback(event));
    unsub = () => data.subscription.unsubscribe();
  });
  return () => unsub();
}

export async function signOut() {
  if (!BACKEND) { sessionStorage.removeItem(KEY); return; }
  const sb = await supabase();
  await sb.auth.signOut();
}
