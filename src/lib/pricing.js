/**
 * Order pricing rules — shared by the browser (to show totals) and the
 * Netlify checkout function (which recalculates everything server-side).
 */
export const ESTIMATED_TAX_RATE = 0.0825; // placeholder — Stripe Tax can replace this
export const FREE_SHIPPING_AT = 100;

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard shipping', detail: '5–7 business days after your item is made', price: 8 },
  { id: 'priority', label: 'Priority shipping', detail: '2–3 business days after your item is made', price: 18 },
  { id: 'pickup', label: 'Local pickup', detail: 'Jessica will message you when it’s ready', price: 0 },
];

const round = (n) => Math.round(n * 100) / 100;

export function shippingCost(methodId, subtotal) {
  const m = SHIPPING_METHODS.find((x) => x.id === methodId) || SHIPPING_METHODS[0];
  if (m.id === 'standard' && subtotal >= FREE_SHIPPING_AT) return 0;
  return m.price;
}

export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  const raw = coupon.type === 'percent' ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
  return round(Math.min(subtotal, raw));
}

export function totals({ subtotal, shippingMethod, coupon }) {
  const discount = couponDiscount(coupon, subtotal);
  const shipping = shippingCost(shippingMethod, subtotal);
  const tax = round((subtotal - discount) * ESTIMATED_TAX_RATE);
  const total = round(subtotal - discount + shipping + tax);
  return { subtotal: round(subtotal), discount, shipping, tax, total };
}
