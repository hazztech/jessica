/**
 * Server-side admin guard for Netlify Functions — the real protection layer.
 *
 * Use at the top of every admin function:
 *
 *   import { requireAdmin } from './_lib/requireAdmin.js';
 *   export default async (req) => {
 *     const denied = await requireAdmin(req);
 *     if (denied) return denied;
 *     ...admin work...
 *   };
 *
 * `verifyToken` must check the bearer token with your auth provider
 * (e.g. Supabase `auth.getUser(token)`) and return { id, email, roles } or null.
 * Secrets live in Netlify environment variables — never in src/.
 */
export async function requireAdmin(req, verifyToken = defaultVerify) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return json(401, { error: 'Sign in required' });
  const user = await verifyToken(token);
  if (!user) return json(401, { error: 'Session expired' });
  if (!user.roles?.includes('admin')) return json(403, { error: 'Not allowed' });
  return null;
}

async function defaultVerify() {
  // Fail closed until a provider is configured.
  return null;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
