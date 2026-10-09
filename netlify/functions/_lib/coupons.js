import { db, HttpError } from './supabase.js';

/** Look up a coupon and check it can be used for this subtotal. */
export async function findValidCoupon(code, subtotal) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return null;
  const { data: c } = await db().from('coupons').select('*').eq('code', clean).maybeSingle();
  const now = Date.now();
  const invalid =
    !c || !c.active ||
    (c.starts_at && Date.parse(c.starts_at) > now) ||
    (c.ends_at && Date.parse(c.ends_at) < now) ||
    (c.max_uses != null && c.uses >= c.max_uses);
  if (invalid) throw new HttpError(400, 'That code isn’t valid.');
  if (subtotal < Number(c.min_subtotal || 0)) {
    throw new HttpError(400, `That code needs a subtotal of $${Number(c.min_subtotal).toFixed(2)} or more.`);
  }
  return { code: c.code, type: c.type, value: Number(c.value) };
}
