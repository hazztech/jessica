/**
 * POST /api/checkout
 * Body: { items: [{ productId, quantity, selections }], contact, shippingAddress, billingAddress,
 *         sameBilling, shippingMethod, couponCode, files: { folder, token } }
 *
 * The server ignores any prices from the browser: it loads each product from the
 * database, re-validates the customization, re-prices every line with the same
 * engine the storefront uses, applies the coupon, shipping and tax, then saves the order.
 *
 * Payments: when PAYMENTS_ENABLED=true and STRIPE_SECRET_KEY is set, a Stripe
 * Checkout Session is created and { url } is returned. Otherwise the order is
 * recorded as unpaid (preview) and { order } is returned.
 */
import { handler, json, readJson } from './_lib/http.js';
import { db, HttpError, must } from './_lib/supabase.js';
import { confirmUploads, LIMITS } from './_lib/uploads.js';
import { findValidCoupon } from './_lib/coupons.js';
import { sendEmail, templates } from './_lib/email.js';
import { createCheckoutSession } from './_lib/stripe.js';
import { buildCartLine, resolveSchema, validate } from '../../src/lib/customization.js';
import { productFromRow } from '../../src/lib/mappers.js';
import { totals, SHIPPING_METHODS } from '../../src/lib/pricing.js';
import { contactFields, shippingFields, billingFields } from '../../src/data/checkoutForm.js';
import { cleanSelections } from '../../src/lib/customization.js';

export const paymentsEnabled = () => process.env.PAYMENTS_ENABLED === 'true' && !!process.env.STRIPE_SECRET_KEY;

export default handler(['POST'], async (req) => {
  const body = await readJson(req, 256 * 1024);

  // 1) contact + addresses
  const errors = {
    ...prefix('contact', validate(contactFields, body.contact || {})),
    ...prefix('ship', validate(shippingFields, body.shippingAddress || {})),
    ...(body.sameBilling ? {} : prefix('bill', validate(billingFields, body.billingAddress || {}))),
  };
  if (!SHIPPING_METHODS.some((m) => m.id === body.shippingMethod)) errors.shippingMethod = 'Choose a shipping method.';
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length || items.length > 50) errors.items = 'Your cart is empty.';
  if (Object.keys(errors).length) throw new HttpError(422, 'Please check your details.', errors);

  // 2) products from the database
  const ids = [...new Set(items.map((i) => String(i.productId)))];
  const rows = must(await db().from('products')
    .select('*, product_images(url, src_set, alt, width, height, sort)')
    .in('id', ids).eq('active', true).eq('archived', false), 'Could not load products');
  const products = new Map(rows.map((r) => [r.id, productFromRow(r)]));

  // 3) validate + re-price every line; collect upload claims
  const claimedFiles = [];
  const lines = items.map((item, idx) => {
    const product = products.get(String(item.productId));
    if (!product) throw new HttpError(409, 'An item in your cart is no longer available. Please remove it and try again.');
    const quantity = Math.round(Number(item.quantity));
    if (!(quantity >= 1 && quantity <= 99)) throw new HttpError(422, `Check the quantity for ${product.name}.`);
    const fields = resolveSchema(product);
    const selections = item.selections && typeof item.selections === 'object' ? item.selections : {};
    const lineErrors = validate(fields, selections);
    if (Object.keys(lineErrors).length) {
      throw new HttpError(422, `Please review the options for ${product.name}.`, { [`item${idx}`]: lineErrors });
    }
    const uploads = fields.filter((f) => f.type === 'upload').flatMap((f) => (Array.isArray(selections[f.id]) ? selections[f.id] : []));
    claimedFiles.push(...uploads.map((u) => ({ ...u, line: idx })));
    return { product, line: buildCartLine(product, fields, selections, quantity) };
  });

  // 4) stock (made-to-order items have no limit)
  const wanted = new Map();
  for (const { product, line } of lines) wanted.set(product.id, (wanted.get(product.id) || 0) + line.quantity);
  for (const [id, qty] of wanted) {
    const p = products.get(id);
    if (p.inventory != null && qty > p.inventory) {
      throw new HttpError(409, p.inventory === 0 ? `${p.name} is sold out.` : `Only ${p.inventory} of ${p.name} left.`);
    }
  }

  // 5) uploaded customization files must exist in the signed folder
  if (claimedFiles.length > LIMITS.order) throw new HttpError(400, 'Too many files attached.');
  const confirmed = await confirmUploads(claimedFiles, body.files?.folder, body.files?.token);
  const uploadsByLine = new Map();
  confirmed.forEach((f, i) => {
    const line = claimedFiles[i].line;
    uploadsByLine.set(line, [...(uploadsByLine.get(line) || []), f]);
  });

  // 6) totals
  const subtotal = lines.reduce((s, { line }) => s + line.unitPrice * line.quantity, 0);
  const coupon = body.couponCode ? await findValidCoupon(body.couponCode, subtotal) : null;
  const t = totals({ subtotal, shippingMethod: body.shippingMethod, coupon });

  // 7) save the order
  const contact = cleanSelections(contactFields, body.contact);
  const shippingAddress = cleanSelections(shippingFields, body.shippingAddress);
  const billingAddress = body.sameBilling ? shippingAddress : cleanSelections(billingFields, body.billingAddress);
  const live = paymentsEnabled();

  const order = must(await db().from('orders').insert({
    customer: { name: `${shippingAddress.firstName} ${shippingAddress.lastName}`, email: contact.email.toLowerCase(), phone: contact.phone || '' },
    shipping_address: shippingAddress, billing_address: billingAddress, shipping_method: body.shippingMethod,
    subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, tax: t.tax, total: t.total,
    coupon_code: coupon?.code || null, payment_status: 'unpaid', status: 'new', preview: !live,
  }).select('*').single(), 'Could not save your order');

  const itemRows = lines.map(({ product, line }, idx) => ({
    order_id: order.id, product_id: product.id, name: product.name, category: product.category,
    unit_price: line.unitPrice, quantity: line.quantity, selections: line.selections,
    summary: line.summary.map(({ fieldId, label, value, price }) => ({ fieldId, label, value, price: price || 0 })),
    charges: line.charges, uploads: uploadsByLine.get(idx) || [],
  }));
  must(await db().from('order_items').insert(itemRows), 'Could not save your order items');

  // 8a) payments on → Stripe Checkout
  if (live) {
    const session = await createCheckoutSession({ order, items: itemRows, totals: t });
    must(await db().from('orders').update({ stripe_session_id: session.id }).eq('id', order.id), 'Could not start payment');
    return json(200, { url: session.url, orderNumber: order.order_number });
  }

  // 8b) preview → recorded unpaid, notify Jessica
  if (coupon) await db().rpc('increment_coupon_use', { p_code: coupon.code });
  await Promise.all([
    sendEmail({ to: process.env.NOTIFY_EMAIL, replyTo: contact.email, ...templates.orderToJessica(order, itemRows) }),
  ]);
  return json(201, {
    order: {
      orderNumber: order.order_number, preview: true, total: t.total,
      customer: order.customer, items: itemRows.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unit_price })),
    },
  });
});

function prefix(p, errs) {
  return Object.fromEntries(Object.entries(errs).map(([k, v]) => [`${p}.${k}`, v]));
}
