/**
 * Checkout service.
 *   Preview: no payment; the order is recorded as unpaid in this browser.
 *   Live:    customization files upload to private storage, then /api/checkout
 *            re-prices everything on the server and saves the order. When payments
 *            are enabled on the server it returns a Stripe Checkout URL.
 */
import { BACKEND, api, stash } from '../lib/backend.js';
import { totals } from '../lib/pricing.js';
import { createOrder } from './orders.js';
import { findCoupon } from './coupons.js';
import { uploadCustomerFiles } from './uploads.js';

export { ESTIMATED_TAX_RATE, FREE_SHIPPING_AT, SHIPPING_METHODS, shippingCost, totals } from '../lib/pricing.js';

/** Payments are switched on server-side (PAYMENTS_ENABLED). The UI only explains the current mode. */
export const PAYMENTS_LIVE = false;

export async function applyCoupon(code, subtotal) {
  if (BACKEND) return api('coupon', { code, subtotal });
  const c = await findCoupon(code);
  if (!c) throw new Error('That code isn’t valid.');
  return c;
}

const isFileList = (v) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] && 'size' in v[0];

/**
 * Returns { order } (preview or payments off) or { redirectUrl } (Stripe).
 * order: { orderNumber, preview, total, customer, items: [{ name, quantity, unitPrice }] }
 */
export async function placeOrder({ items, contact, shippingAddress, billingAddress, sameBilling, shippingMethod, coupon }) {
  if (BACKEND) {
    // upload any customization files attached to cart lines
    const metas = items.flatMap((l) => Object.values(l.selections || {}).filter(isFileList).flat());
    const files = await uploadCustomerFiles('order', metas);
    const byClient = new Map((files?.items || []).map((f) => [f.clientId, f]));
    const lines = items.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      selections: Object.fromEntries(Object.entries(l.selections || {}).map(([k, v]) =>
        [k, isFileList(v) ? v.map((m) => byClient.get(m.id)) : v])),
    }));
    const res = await api('checkout', {
      items: lines, contact, shippingAddress, billingAddress, sameBilling, shippingMethod,
      couponCode: coupon?.code || null,
      files: files ? { folder: files.folder, token: files.token } : null,
    });
    if (res.url) {
      stash.set('last-order', { orderNumber: res.orderNumber, pendingPayment: true });
      return { redirectUrl: res.url };
    }
    stash.set('last-order', res.order);
    return { order: res.order };
  }

  const subtotal = items.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const t = totals({ subtotal, shippingMethod, coupon });
  await new Promise((r) => setTimeout(r, 600));
  const order = await createOrder({
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
    preview: true,
  });
  return { order };
}
