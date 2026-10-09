/**
 * Minimal Stripe REST helpers (no SDK needed).
 * Only used when PAYMENTS_ENABLED=true. Secret key stays in Netlify env vars.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './supabase.js';

const cents = (n) => Math.round(Number(n) * 100);

/** Flatten nested objects into Stripe's form encoding: a[b][0][c]=v */
export function encodeForm(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') encodeForm(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe(path, params) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: encodeForm(params),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Stripe error', data?.error);
    throw new HttpError(502, 'Payment could not be started. Please try again.');
  }
  return data;
}

export async function createCheckoutSession({ order, items, totals }) {
  const site = process.env.SITE_URL || process.env.URL;
  const lineItems = items.map((i) => ({
    quantity: i.quantity,
    price_data: { currency: 'usd', unit_amount: cents(i.unit_price), product_data: { name: i.name } },
  }));
  if (totals.shipping > 0) lineItems.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: cents(totals.shipping), product_data: { name: 'Shipping' } } });
  if (totals.tax > 0) lineItems.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: cents(totals.tax), product_data: { name: 'Estimated tax' } } });

  const params = {
    mode: 'payment',
    customer_email: order.customer.email,
    client_reference_id: order.order_number,
    metadata: { order_id: order.id, order_number: order.order_number },
    line_items: lineItems,
    success_url: `${site}/checkout/confirmation?order=${order.order_number}&paid=1`,
    cancel_url: `${site}/checkout?cancelled=1`,
  };
  if (totals.discount > 0) {
    const coupon = await stripe('coupons', { amount_off: cents(totals.discount), currency: 'usd', duration: 'once', name: order.coupon_code || 'Discount' });
    params.discounts = [{ coupon: coupon.id }];
  }
  return stripe('checkout/sessions', params);
}

/** Verify the Stripe-Signature header (HMAC-SHA256, 5-minute tolerance). */
export function verifyStripeSignature(payload, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')).filter((p) => p.length === 2).map(([k, v]) => [k, v]));
  const signatures = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = Number(parts.t);
  if (!t || !signatures.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex'));
  return signatures.some((s) => {
    const b = Buffer.from(s);
    return b.length === expected.length && timingSafeEqual(b, expected);
  });
}
