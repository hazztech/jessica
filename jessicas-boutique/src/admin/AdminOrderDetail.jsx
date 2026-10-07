import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { ORDER_STATUSES, getOrder, orderStatusLabel, updateOrder } from '../services/orders.js';
import { getCategory } from '../data/categories.js';
import { sanitizeText } from '../lib/sanitize.js';
import { useToast } from '../context/ToastContext.jsx';
import { money, stamp } from './useLiveData.js';
import Button from '../components/Button.jsx';
import OrderStatusPill from './OrderStatusPill.jsx';

const NEXT = { new: 'paid', paid: 'processing', processing: 'in-production', 'in-production': 'finishing', finishing: 'ready', ready: 'shipped', shipped: 'delivered' };

export default function AdminOrderDetail({ orderNumber }) {
  const toast = useToast();
  const [o, setO] = useState(undefined);
  const [form, setForm] = useState(null);

  useEffect(() => {
    getOrder(orderNumber).then((x) => {
      setO(x);
      if (x) setForm({ status: x.status, trackingNumber: x.trackingNumber || '', notes: x.notes || '' });
    });
  }, [orderNumber]);

  if (o === undefined) return <div className="admin-page" aria-busy="true" />;
  if (!o) return <div className="admin-page"><h1 className="admin-title">Order not found</h1><Link to="/admin/orders">Back to orders</Link></div>;

  const save = async (patch = {}) => {
    const next = { ...form, ...patch };
    if (next.status === 'shipped' && !next.trackingNumber.trim()) {
      toast('Add a tracking number before marking as shipped.');
      return;
    }
    const updated = await updateOrder(o.orderNumber, {
      status: next.status, trackingNumber: sanitizeText(next.trackingNumber, 60), notes: sanitizeText(next.notes, 4000),
    });
    setO(updated);
    setForm({ status: updated.status, trackingNumber: updated.trackingNumber, notes: updated.notes });
    toast(`Order ${o.orderNumber} — ${orderStatusLabel(updated.status)}`);
  };
  const dirty = form.status !== o.status || form.trackingNumber !== (o.trackingNumber || '') || form.notes !== (o.notes || '');
  const next = NEXT[o.status];

  return (
    <div className="admin-page">
      <Link to="/admin/orders" className="admin-back">← Orders</Link>
      <div className="rd__head">
        <div>
          <h1 className="admin-title">{o.orderNumber}</h1>
          <p className="rd__sub">Placed {stamp(o.createdAt)}{o.sample ? ' · Sample order' : ''}</p>
        </div>
        <div className="rd__flags">
          <OrderStatusPill status={o.status} />
          <span className={`pay pay--${o.paymentStatus}`}>{o.paymentStatus}</span>
        </div>
      </div>

      <div className="rd__grid">
        <div className="rd__main">
          <section className="admin-panel">
            <h2>Items</h2>
            <ul role="list" className="od__items">
              {o.items.map((i, n) => (
                <li key={n}>
                  <div>
                    <strong>{i.name}</strong>
                    <span className="od__cat">{getCategory(i.category)?.name}</span>
                    {i.summary?.length > 0 && (
                      <dl className="od__opts">{i.summary.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
                    )}
                  </div>
                  <span className="od__qty">{i.quantity} × {money(i.unitPrice)}</span>
                  <strong className="atable__num">{money(i.quantity * i.unitPrice)}</strong>
                </li>
              ))}
            </ul>
            <dl className="od__totals">
              <div><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
              {o.discount > 0 && <div><dt>Discount</dt><dd>−{money(o.discount)}</dd></div>}
              <div><dt>Shipping</dt><dd>{o.shipping ? money(o.shipping) : 'Free'}</dd></div>
              <div><dt>Tax</dt><dd>{money(o.tax)}</dd></div>
              <div className="od__grand"><dt>Total</dt><dd>{money(o.total)}</dd></div>
            </dl>
          </section>

          <section className="admin-panel">
            <h2>Customer & shipping</h2>
            <dl className="rd__rows">
              <div><dt>Name</dt><dd>{o.customer.name}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${o.customer.email}?subject=${encodeURIComponent(`Your order ${o.orderNumber}`)}`}>{o.customer.email}</a></dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${o.customer.phone.replace(/[^\d+]/g, '')}`}>{o.customer.phone}</a></dd></div>
              <div><dt>Ship to</dt><dd>{[o.shippingAddress.line1 || o.shippingAddress.address1, o.shippingAddress.address2].filter(Boolean).join(', ')}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}</dd></div>
              {o.shippingMethod && <div><dt>Method</dt><dd style={{ textTransform: 'capitalize' }}>{o.shippingMethod}</dd></div>}
              {o.preview && <div><dt>Payment</dt><dd>Preview order — no payment taken</dd></div>}
            </dl>
          </section>
        </div>

        <aside className="rd__side">
          <form className="admin-panel rd__manage" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <h2>Manage order</h2>
            {next && o.status !== 'cancelled' && (
              <Button type="button" variant="secondary" full onClick={() => save({ status: next })}>
                Mark as {orderStatusLabel(next)}
              </Button>
            )}
            <label className="cz-label" htmlFor="od-status">Status</label>
            <div className="cz-select">
              <select id="od-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {ORDER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <label className="cz-label" htmlFor="od-track">Tracking number</label>
            <input id="od-track" className="cz-input" value={form.trackingNumber} maxLength={60}
              onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} placeholder="Required when shipped" />
            <label className="cz-label" htmlFor="od-notes">Internal notes</label>
            <textarea id="od-notes" className="cz-input cz-input--area" rows={4} value={form.notes} maxLength={4000}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Only visible to admins" />
            <Button type="submit" full disabled={!dirty}>Save changes</Button>
          </form>
          <section className="admin-panel">
            <h2>History</h2>
            <ol role="list" className="rd__history">
              {[...o.statusHistory].reverse().map((h, i) => (
                <li key={i}><strong>{orderStatusLabel(h.status)}</strong><span>{stamp(h.at)}</span></li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
