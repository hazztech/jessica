/**
 * Checkout service.
 *
 * PREVIEW: no payment is taken. placeOrder() records the order as unpaid in
 * Admin → Orders so the whole flow can be tested.
 *
 * STRIPE (later): placeOrder() will POST the cart to a Netlify Function that
 * re-prices every line on the server (never trust browser prices), creates a
 * Stripe Checkout Session or PaymentIntent with the SECRET key (Netlify env var),
 * and returns the client secret/redirect URL. A Stripe webhook marks the order paid.
 */
import { createOrder } from './orders.js';
import { findCoupon } from './coupons.js';

export const PAYMENTS_LIVE = false;
export const ESTIMATED_TAX_RATE = 0.0825; // placeholder — Stripe Tax calculates the real amount
export const FREE_SHIPPING_AT = 100;

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard shipping', detail: '5–7 business days after your item is made', price: 8 },
  { id: 'priority', label: 'Priority shipping', detail: '2–3 business days after your item is made', price: 18 },
  { id: 'pickup', label: 'Local pickup', detail: 'Jessica will message you when it’s ready', price: 0 },
];

export function shippingCost(methodId, subtotal) {
  const m = SHIPPING_METHODS.find((x) => x.id === methodId) || SHIPPING_METHODS[0];
  if (m.id === 'standard' && subtotal >= FREE_SHIPPING_AT) return 0;
  return m.price;
}

export function totals({ subtotal, shippingMethod, coupon }) {
  const discount = coupon ? Math.min(subtotal, coupon.type === 'percent' ? Math.round(subtotal * coupon.value) / 100 : coupon.value) : 0;
  const shipping = shippingCost(shippingMethod, subtotal);
  const tax = Math.round((subtotal - discount) * ESTIMATED_TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;
  return { subtotal, discount, shipping, tax, total };
}

export async function applyCoupon(code) {
  const c = await findCoupon(code);
  if (!c) throw new Error('That code isn’t valid.');
  return c;
}

export async function placeOrder({ items, contact, shippingAddress, billingAddress, shippingMethod, coupon }) {
  const subtotal = items.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const t = totals({ subtotal, shippingMethod, coupon });
  await new Promise((r) => setTimeout(r, 600));
  return createOrder({
    customer: { name: `${shippingAddress.firstName} ${shippingAddress.lastName}`, email: contact.email, phone: contact.phone || '' },
    shippingAddress, billingAddress, shippingMethod,
    items: items.map((l) => ({
      productId: l.productId, name: l.name, category: l.category, unitPrice: l.unitPrice, quantity: l.quantity,
      summary: (l.summary || []).map(({ label, value }) => ({ label, value })),
      uploads: Object.values(l.selections || {}).filter(Array.isArray).flat(),
    })),
    couponCode: coupon?.code || null,
    ...t,
    paymentStatus: 'unpaid',
    preview: !PAYMENTS_LIVE,
  });
}
