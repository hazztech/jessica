/**
 * Backend switch.
 *   • VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set → live mode (Supabase + Netlify Functions)
 *   • not set → preview mode (everything stored in this browser, as before)
 * The anon key is public by design; Row Level Security in the database decides
 * what each visitor can read or write.
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
export const BACKEND = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let clientPromise = null;
/** Lazily load supabase-js so preview mode never downloads it. */
export function supabase() {
  if (!BACKEND) throw new Error('Supabase is not configured');
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      }));
  }
  return clientPromise;
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Call a Netlify Function: api('checkout', body) → POST /api/checkout */
export async function api(name, body) {
  let res;
  try {
    res = await fetch(`/api/${name}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('We couldn’t reach the server. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong. Please try again.', res.status, data.details);
  return data;
}

/** Throw on Supabase errors with a friendly message */
export function check({ data, error }, message = 'Something went wrong. Please try again.') {
  if (error) {
    console.error(message, error);
    const e = new Error(error.code === '23505' ? 'That already exists — please use a different value.' : message);
    e.code = error.code;
    throw e;
  }
  return data;
}

/** Short-lived handoff between pages (e.g. checkout → confirmation) */
export const stash = {
  set: (key, value) => { try { sessionStorage.setItem(`jcsa-${key}`, JSON.stringify(value)); } catch { /* ignore */ } },
  get: (key) => { try { return JSON.parse(sessionStorage.getItem(`jcsa-${key}`) || 'null'); } catch { return null; } },
};
