/**
 * Coupons. Admin coupon management comes later; until then one SAMPLE code
 * exists so the discount field can be tested. Remove before launch.
 */
const SAMPLE = [{ code: 'SPARKLE10', type: 'percent', value: 10, sample: true }];
export async function findCoupon(code) {
  const c = String(code || '').trim().toUpperCase();
  return SAMPLE.find((x) => x.code === c) || null;
}
