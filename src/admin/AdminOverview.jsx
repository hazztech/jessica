import { Link } from '../lib/router.jsx';
import { listCustomRequests, CLOSED_STATUSES } from '../services/customRequests.js';
import { listOrders, isToday, countsAsRevenue, PENDING_ORDER, ACTIVE_PRODUCTION } from '../services/orders.js';
import { listProducts, isLowStock } from '../services/catalog.js';
import { useLiveData, money } from './useLiveData.js';
import RequestTable from './RequestTable.jsx';
import OrderTable from './OrderTable.jsx';

const AWAITING_QUOTE = ['new', 'reviewing', 'need-info'];

export default function AdminOverview() {
  const [data] = useLiveData(async () => {
    const [orders, requests, products] = await Promise.all([listOrders(), listCustomRequests(), listProducts()]);
    return { orders, requests, products };
  });
  if (!data) return <div className="admin-page" aria-busy="true" />;
  const { orders, requests, products } = data;

  const today = orders.filter((o) => isToday(o.createdAt));
  const pending = orders.filter((o) => PENDING_ORDER.includes(o.status));
  const openReq = requests.filter((r) => !CLOSED_STATUSES.includes(r.status));
  const awaitingQuote = requests.filter((r) => AWAITING_QUOTE.includes(r.status) && r.quotedPrice == null);
  const inProduction = orders.filter((o) => ACTIVE_PRODUCTION.includes(o.status));
  const reqInProduction = requests.filter((r) => ['in-production', 'finishing'].includes(r.status));
  const since = Date.now() - 30 * 864e5;
  const revenue30 = orders.filter((o) => countsAsRevenue(o) && new Date(o.createdAt) >= since).reduce((s, o) => s + o.total, 0);
  const revenueToday = today.filter(countsAsRevenue).reduce((s, o) => s + o.total, 0);
  const low = products.filter(isLowStock);

  const cards = [
    { label: 'Today’s Orders', value: today.length, note: `${money(revenueToday)} paid today`, to: '/admin/orders' },
    { label: 'Pending Orders', value: pending.length, note: 'New, paid or processing', to: '/admin/orders?status=pending', tone: pending.length ? 'attention' : '' },
    { label: 'Custom Requests', value: openReq.length, note: `${requests.filter((r) => r.status === 'new').length} new`, to: '/admin/requests' },
    { label: 'Requests Awaiting Quote', value: awaitingQuote.length, note: 'No quote entered yet', to: '/admin/requests?status=new', tone: awaitingQuote.length ? 'attention' : '' },
    { label: 'Orders In Production', value: inProduction.length, note: `+ ${reqInProduction.length} custom request${reqInProduction.length === 1 ? '' : 's'}`, to: '/admin/orders?status=in-production' },
    { label: 'Revenue', value: money(revenue30), note: 'Paid orders, last 30 days', to: '/admin/orders', wide: true },
    { label: 'Low Inventory', value: low.length, note: low.length ? low.map((p) => p.name).slice(0, 2).join(', ') : 'All stocked items OK', to: '/admin/products?filter=low', tone: low.length ? 'warn' : '' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="admin-title">Overview</h1>
        <div className="admin-head__actions">
          <Link className="btn btn--secondary btn--sm" to="/admin/gallery">Upload to gallery</Link>
          <Link className="btn btn--primary btn--sm" to="/admin/products/new">Add product</Link>
        </div>
      </div>

      <ul role="list" className="ov-cards">
        {cards.map((c) => (
          <li key={c.label}>
            <Link to={c.to} className={`ov-card ${c.tone ? `ov-card--${c.tone}` : ''}`}>
              <span className="ov-card__label">{c.label}</span>
              <strong className="ov-card__value">{c.value}</strong>
              <span className="ov-card__note">{c.note}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="ov-lists">
        <section className="admin-panel" aria-labelledby="ov-req">
          <div className="admin-panel__head">
            <h2 id="ov-req">New Custom Requests</h2>
            <Link to="/admin/requests">All requests</Link>
          </div>
          <RequestTable compact requests={requests.filter((r) => r.status === 'new').slice(0, 5)}
            empty="No new requests. New submissions appear here instantly." />
        </section>
        <section className="admin-panel" aria-labelledby="ov-orders">
          <div className="admin-panel__head">
            <h2 id="ov-orders">Orders needing attention</h2>
            <Link to="/admin/orders">All orders</Link>
          </div>
          <OrderTable compact orders={pending.slice(0, 5)} empty="Nothing waiting — nice work." />
        </section>
      </div>
    </div>
  );
}
