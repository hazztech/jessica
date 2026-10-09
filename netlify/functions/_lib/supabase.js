/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * It bypasses Row Level Security, so it must never reach the browser:
 * SUPABASE_SERVICE_ROLE_KEY is set in Netlify env vars (no VITE_ prefix).
 */
import { createClient } from '@supabase/supabase-js';

let client;
export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new HttpError(500, 'Server is not configured (missing Supabase environment variables).');
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Throws on a Supabase error so handlers stay linear */
export function must({ data, error }, message = 'Database error') {
  if (error) {
    console.error(message, error);
    throw new HttpError(500, message);
  }
  return data;
}
