import { Link } from '../lib/router.jsx';
import { getCategory } from '../data/categories.js';
import { formatDate } from '../lib/customization.js';
import { money, shortDate } from './useLiveData.js';
import StatusPill from './StatusPill.jsx';

/** Custom requests table. `compact` hides secondary columns (overview). */
export default function RequestTable({ requests, empty, compact = false }) {
  if (!requests.length) return <p className="admin-empty">{empty}</p>;
  return (
    <div className="atable-wrap" tabIndex={0} role="region" aria-label="Custom requests table">
      <table className={`atable ${compact ? 'atable--compact' : ''}`}>
        <thead>
          <tr>
            <th scope="col">Request Number</th>
            <th scope="col">Customer</th>
            <th scope="col">Item Type</th>
            {!compact && <th scope="col">Date</th>}
            <th scope="col">Budget</th>
            {!compact && <th scope="col">Requested Date</th>}
            <th scope="col">Status</th>
            {!compact && <th scope="col">Quote</th>}
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.requestId}>
              <th scope="row">
                <Link to={`/admin/requests/${r.requestId}`} className="atable__key">{r.requestId}</Link>
                {r.rushRequested && <span className="atable__flag">Rush</span>}
              </th>
              <td>{r.customerName}</td>
              <td>{r.itemTypes.map((t) => getCategory(t)?.name).join(', ')}</td>
              {!compact && <td>{shortDate(r.createdAt)}</td>}
              <td>{r.budgetLabel || '—'}</td>
              {!compact && <td>{r.requestedDate ? formatDate(r.requestedDate) : '—'}</td>}
              <td><StatusPill status={r.status} /></td>
              {!compact && <td className="atable__num">{r.quotedPrice != null ? money(r.quotedPrice) : '—'}</td>}
              <td className="atable__actions">
                <Link to={`/admin/requests/${r.requestId}`} className="atable__btn">View</Link>
                {!compact && (
                  <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your custom request ${r.requestId}`)}`}
                    className="atable__btn" aria-label={`Email ${r.customerName}`}>Email</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
