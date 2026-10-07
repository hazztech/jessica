import { useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { ORDER_STATUSES, PENDING_ORDER, listOrders, removeSampleOrders } from '../services/orders.js';
import { useLiveData } from './useLiveData.js';
import OrderTable from './OrderTable.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function AdminOrders() {
  const { query } = useRouter();
  const status = query.get('status') || 'all';
  const [orders] = useLiveData(() => listOrders());
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(false);
  if (!orders) return <div className="admin-page" aria-busy="true" />;

  const count = (id) => orders.filter((o) => o.status === id).length;
  const tabs = [
    { id: 'all', label: 'All', n: orders.length },
    { id: 'pending', label: 'Pending', n: orders.filter((o) => PENDING_ORDER.includes(o.status)).length },
    ...ORDER_STATUSES.map((s) => ({ id: s.id, label: s.label, n: count(s.id) })),
  ];
  const term = q.trim().toLowerCase();
  const shown = orders
    .filter((o) => status === 'all' || (status === 'pending' ? PENDING_ORDER.includes(o.status) : o.status === status))
    .filter((o) => !term || `${o.orderNumber} ${o.customer.name} ${o.customer.email}`.toLowerCase().includes(term));
  const hasSamples = orders.some((o) => o.sample);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="admin-title">Orders</h1>
        {hasSamples && (
          <button type="button" className="atable__btn" onClick={() => setConfirm(true)}>Remove sample orders</button>
        )}
      </div>
      <div className="admin-toolbar">
        <nav aria-label="Order status" className="admin-tabs">
          {tabs.map((t) => (
            <Link key={t.id} to={`/admin/orders?status=${t.id}`} className={`admin-tab ${t.id === status ? 'is-active' : ''}`}
              aria-current={t.id === status ? 'page' : undefined}>
              {t.label}<span className="admin-tab__n">{t.n}</span>
            </Link>
          ))}
        </nav>
        <label className="admin-search">
          <span className="visually-hidden">Search orders</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, name or email" />
        </label>
      </div>
      <section className="admin-panel">
        <OrderTable orders={shown} empty={term ? 'No orders match your search.' : 'No orders with this status.'} />
      </section>
      <ConfirmDialog open={confirm} title="Remove sample orders?" confirmLabel="Remove samples" danger
        onCancel={() => setConfirm(false)} onConfirm={async () => { await removeSampleOrders(); setConfirm(false); }}>
        <p>The demonstration orders will be deleted. Real orders are not affected.</p>
      </ConfirmDialog>
    </div>
  );
}
