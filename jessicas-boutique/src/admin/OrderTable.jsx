import { Link } from '../lib/router.jsx';
import { money, shortDate } from './useLiveData.js';
import OrderStatusPill from './OrderStatusPill.jsx';

export default function OrderTable({ orders, empty, compact = false }) {
  if (!orders.length) return <p className="admin-empty">{empty}</p>;
  return (
    <div className="atable-wrap" tabIndex={0} role="region" aria-label="Orders table">
      <table className={`atable ${compact ? 'atable--compact' : ''}`}>
        <thead>
          <tr>
            <th scope="col">Order</th>
            {!compact && <th scope="col">Date</th>}
            <th scope="col">Customer</th>
            {!compact && <th scope="col">Items</th>}
            <th scope="col">Total</th>
            {!compact && <th scope="col">Payment</th>}
            <th scope="col">Status</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderNumber}>
              <th scope="row">
                <Link to={`/admin/orders/${o.orderNumber}`} className="atable__key">{o.orderNumber}</Link>
                {o.sample && <span className="atable__flag atable__flag--muted">Sample</span>}
              </th>
              {!compact && <td>{shortDate(o.createdAt)}</td>}
              <td>{o.customer.name}</td>
              {!compact && <td>{o.items.reduce((n, i) => n + i.quantity, 0)} · {o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}</td>}
              <td className="atable__num">{money(o.total)}</td>
              {!compact && <td><span className={`pay pay--${o.paymentStatus}`}>{o.paymentStatus}</span></td>}
              <td><OrderStatusPill status={o.status} /></td>
              <td className="atable__actions"><Link to={`/admin/orders/${o.orderNumber}`} className="atable__btn">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
