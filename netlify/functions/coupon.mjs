/** POST /api/coupon  { code, subtotal } → { code, type, value } */
import { handler, json, readJson } from './_lib/http.js';
import { findValidCoupon } from './_lib/coupons.js';

export default handler(['POST'], async (req) => {
  const { code, subtotal } = await readJson(req, 2048);
  const coupon = await findValidCoupon(code, Number(subtotal) || 0);
  if (!coupon) return json(400, { error: 'Enter a code.' });
  return json(200, coupon);
});
