/**
 * Server-side admin guard for Netlify Functions.
 * Verifies the Supabase access token (Authorization: Bearer …) and checks
 * profiles.role = 'admin'. Fails closed.
 *
 * Note: most admin work goes straight to Supabase from the browser and is
 * protected by Row Level Security (is_admin()). Use this guard for any
 * function that does privileged work with the service-role key.
 */
import { db, HttpError } from './supabase.js';

export async function requireAdmin(req) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Sign in required');
  const { data, error } = await db().auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, 'Session expired');
  const { data: profile } = await db().from('profiles').select('role').eq('id', data.user.id).single();
  if (profile?.role !== 'admin') throw new HttpError(403, 'Not allowed');
  return data.user;
}
