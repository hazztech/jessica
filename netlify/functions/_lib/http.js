import { HttpError } from './supabase.js';

export const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });

/** Parse a JSON body with a size limit (default 64 KB — files never go through functions). */
export async function readJson(req, maxBytes = 64 * 1024) {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'Request is too large.');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}

/** Wrap a handler: method check + consistent error responses. */
export function handler(methods, fn) {
  return async (req, context) => {
    if (!methods.includes(req.method)) return json(405, { error: 'Method not allowed' }, { allow: methods.join(', ') });
    try {
      return await fn(req, context);
    } catch (err) {
      if (err instanceof HttpError) return json(err.status, { error: err.message, details: err.details });
      console.error(err);
      return json(500, { error: 'Something went wrong. Please try again.' });
    }
  };
}
