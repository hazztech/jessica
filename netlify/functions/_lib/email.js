/**
 * Optional email notifications via Resend (https://resend.com).
 * Set RESEND_API_KEY, EMAIL_FROM (verified sender) and NOTIFY_EMAIL (Jessica).
 * If not configured, emails are skipped and the action still succeeds.
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !to) return { skipped: true };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    });
    if (!res.ok) console.error('Email failed', res.status, await res.text());
    return { ok: res.ok };
  } catch (err) {
    console.error('Email error', err);
    return { ok: false };
  }
}

const shell = (body) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#252525">
  <p style="font-size:18px;color:#05665E;margin:0 0 16px">Jessica’s Customized Shoes &amp; Accessories</p>${body}</div>`;
const site = () => process.env.SITE_URL || process.env.URL || '';

export const templates = {
  requestToCustomer: (r) => ({
    subject: `We received your custom request ${r.requestNumber}`,
    html: shell(`<p>Hi ${esc(r.firstName)},</p><p>Thank you! Your custom request <b>${esc(r.requestNumber)}</b> is in.
      Jessica will review it and contact you about pricing, design details and next steps.</p>
      <p style="color:#565B60;font-size:13px">Final pricing must be approved before production begins.</p>`),
  }),
  requestToJessica: (r) => ({
    subject: `New custom request ${r.requestNumber} — ${r.itemTypes.join(', ')}`,
    html: shell(`<p><b>${esc(r.firstName)} ${esc(r.lastName)}</b> (${esc(r.email)}${r.phone ? `, ${esc(r.phone)}` : ''})
      prefers <b>${esc(r.preferredContactMethod)}</b>.</p><p>Budget: ${esc(r.budgetLabel)}${r.rushRequested ? ' · <b>Rush requested</b>' : ''}</p>
      <p style="white-space:pre-line">${esc(r.description)}</p><p><a href="${site()}/admin/requests">Open in admin</a></p>`),
  }),
  orderToCustomer: (o, items) => ({
    subject: `Order ${o.order_number} confirmed`,
    html: shell(`<p>Thank you for your order <b>${esc(o.order_number)}</b>!</p><ul>${items
      .map((i) => `<li>${i.quantity} × ${esc(i.name)} — $${Number(i.unit_price * i.quantity).toFixed(2)}</li>`).join('')}</ul>
      <p>Total: <b>$${Number(o.total).toFixed(2)}</b></p><p>Jessica will start on your pieces and reach out if any design detail needs a quick check.</p>`),
  }),
  orderToJessica: (o, items) => ({
    subject: `New order ${o.order_number} — $${Number(o.total).toFixed(2)}${o.preview ? ' (preview, unpaid)' : ''}`,
    html: shell(`<p>${esc(o.customer.name)} (${esc(o.customer.email)})</p><ul>${items
      .map((i) => `<li>${i.quantity} × ${esc(i.name)}</li>`).join('')}</ul><p><a href="${site()}/admin/orders">Open in admin</a></p>`),
  }),
};
