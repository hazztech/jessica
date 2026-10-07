/**
 * Order service (orders, orderItems).
 * Checkout isn't connected yet, so the preview starts with SAMPLE orders
 * (flagged `sample: true`) to demonstrate order management. Remove them from
 * Admin → Orders → "Remove sample orders". Real orders will come from Stripe
 * checkout via a Netlify Function.
 */
import { collection } from '../lib/localDb.js';

export const ORDER_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'paid', label: 'Paid' },
  { id: 'processing', label: 'Processing' },
  { id: 'in-production', label: 'In Production' },
  { id: 'finishing', label: 'Finishing Touches' },
  { id: 'ready', label: 'Ready' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];
export const orderStatusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label || id;
export const PENDING_ORDER = ['new', 'paid', 'processing'];
export const ACTIVE_PRODUCTION = ['in-production', 'finishing'];

const daysAgo = (d, h = 10) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, 15, 0, 0);
  return t.toISOString();
};

function sampleOrders() {
  const mk = (n, d, name, email, status, items, extra = {}) => {
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shipping = subtotal >= 100 ? 0 : 8;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;
    const createdAt = daysAgo(d, 9 + (n % 8));
    return {
      orderNumber: `JCS-${1000 + n}`, sample: true, createdAt, updatedAt: createdAt,
      customer: { name, email, phone: '(555) 010-' + String(1000 + n * 37).slice(-4) },
      shippingAddress: { line1: `${120 + n} Sample St`, city: 'Houston', state: 'TX', zip: '77002' },
      items, subtotal, shipping, tax, discount: 0, total: Math.round((subtotal + shipping + tax) * 100) / 100,
      paymentStatus: status === 'new' ? 'unpaid' : status === 'cancelled' ? 'refunded' : 'paid',
      status, trackingNumber: status === 'shipped' || status === 'delivered' ? `1Z999AA1${n}0123456` : '',
      notes: '', statusHistory: [{ status, at: createdAt }], ...extra,
    };
  };
  const item = (productId, name, category, unitPrice, quantity, summary = []) => ({ productId, name, category, unitPrice, quantity, summary });
  return [
    mk(14, 0, 'Sample Customer A', 'a@example.com', 'new', [item('p-501', 'Personalized Ombré Tumbler', 'tumblers', 52, 2, [{ label: 'Name', value: 'Kayla' }, { label: 'Glitter', value: 'Ombré glitter' }])]),
    mk(13, 0, 'Sample Customer B', 'b@example.com', 'paid', [item('p-101', 'Black Pearl & Crystal Bow High-Tops', 'shoes', 200, 1, [{ label: 'Shoe size', value: 'Women’s 8' }, { label: 'Rhinestones', value: 'Full coverage' }])]),
    mk(12, 1, 'Sample Customer C', 'c@example.com', 'processing', [item('p-301', 'Custom Graphic Tee (+ Matching Sneakers)', 'shirts', 35, 6, [{ label: 'Text or phrase', value: 'Team Hazz' }])]),
    mk(11, 2, 'Sample Customer D', 'd@example.com', 'in-production', [item('p-801', 'Custom Denim Jacket', 'jackets', 165, 1, [{ label: 'Back design', value: 'Large back design' }])]),
    mk(10, 3, 'Sample Customer E', 'e@example.com', 'finishing', [item('p-201', 'Birthday Girl Shirt & Pleated Skirt Set', 'outfits', 107, 1, [{ label: 'Name', value: 'Mia' }])]),
    mk(9, 5, 'Sample Customer F', 'f@example.com', 'ready', [item('p-601', 'Music Patch Beanie (+ Matching Tie)', 'hats', 100, 1)]),
    mk(8, 8, 'Sample Customer G', 'g@example.com', 'shipped', [item('p-401', 'Pearl & Chain Statement Tie', 'ties', 75, 4)]),
    mk(7, 15, 'Sample Customer H', 'h@example.com', 'delivered', [item('p-701', 'Custom Design Socks', 'socks', 22, 10)]),
    mk(6, 20, 'Sample Customer I', 'i@example.com', 'cancelled', [item('p-501', 'Personalized Ombré Tumbler', 'tumblers', 42, 1)]),
  ];
}

const db = collection('jcsa-orders-v2', sampleOrders);

export async function listOrders({ status } = {}) {
  const all = db.all().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!status || status === 'all') return all;
  return all.filter((o) => o.status === status);
}
export async function getOrder(orderNumber) { return db.get(orderNumber, 'orderNumber'); }

export async function updateOrder(orderNumber, patch) {
  const o = db.get(orderNumber, 'orderNumber');
  const now = new Date().toISOString();
  const changed = patch.status && patch.status !== o.status;
  const next = {
    ...o, ...patch, updatedAt: now,
    statusHistory: changed ? [...o.statusHistory, { status: patch.status, at: now }] : o.statusHistory,
  };
  return db.upsert(next, 'orderNumber');
}

export async function removeSampleOrders() {
  db.replaceAll(db.all().filter((o) => !o.sample));
}

export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
export const countsAsRevenue = (o) => o.paymentStatus === 'paid' && o.status !== 'cancelled';

/** Create an order (checkout). Order numbers continue from the highest existing one. */
export async function createOrder(data) {
  const all = db.all();
  const max = all.reduce((m, o) => Math.max(m, Number(String(o.orderNumber).replace(/\D/g, '')) || 0), 1000);
  const now = new Date().toISOString();
  const order = {
    ...data, orderNumber: `JCS-${max + 1}`, status: 'new', trackingNumber: '', notes: '',
    statusHistory: [{ status: 'new', at: now }], createdAt: now, updatedAt: now,
  };
  db.upsert(order, 'orderNumber');
  return order;
}
