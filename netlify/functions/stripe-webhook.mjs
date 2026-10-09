/**
 * POST /api/stripe-webhook   (set this URL in Stripe → Developers → Webhooks)
 * Marks the order paid after checkout.session.completed, reduces stock,
 * counts the coupon use and sends confirmation emails. Idempotent.
 */
import { handler, json } from './_lib/http.js';
import { db, HttpError, must } from './_lib/supabase.js';
import { verifyStripeSignature } from './_lib/stripe.js';
import { sendEmail, templates } from './_lib/email.js';

export default handler(['POST'], async (req) => {
  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)) {
    throw new HttpError(400, 'Invalid signature');
  }
  const event = JSON.parse(payload);
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return json(200, { received: true, ignored: event.type });
  }
  const session = event.data.object;
  if (session.payment_status !== 'paid') return json(200, { received: true, pending: true });

  const orderId = session.metadata?.order_id;
  // only the first delivery flips unpaid → paid (Stripe may retry webhooks)
  const { data: updated } = await db().from('orders')
    .update({ payment_status: 'paid', status: 'paid' })
    .eq('id', orderId).neq('payment_status', 'paid')
    .select('*, order_items(*)');
  const order = updated?.[0];
  if (!order) return json(200, { received: true, duplicate: true });

  for (const item of order.order_items) {
    if (item.product_id) must(await db().rpc('decrement_inventory', { p_product_id: item.product_id, p_qty: item.quantity }), 'Stock update failed');
  }
  if (order.coupon_code) await db().rpc('increment_coupon_use', { p_code: order.coupon_code });

  await Promise.all([
    sendEmail({ to: order.customer.email, ...templates.orderToCustomer(order, order.order_items) }),
    sendEmail({ to: process.env.NOTIFY_EMAIL, replyTo: order.customer.email, ...templates.orderToJessica(order, order.order_items) }),
  ]);
  return json(200, { received: true, order: order.order_number });
});
