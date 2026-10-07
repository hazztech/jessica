import { useEffect, useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { listCustomRequests } from '../services/customRequests.js';
import RequestTable from './RequestTable.jsx';

const TABS = [
  { id: 'new', label: 'New Custom Requests' },
  { id: 'open', label: 'In Progress' },
  { id: 'closed', label: 'Completed & Cancelled' },
  { id: 'all', label: 'All' },
];

export default function AdminRequests() {
  const { query } = useRouter();
  const status = TABS.some((t) => t.id === query.get('status')) ? query.get('status') : 'new';
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => { setRows(null); listCustomRequests({ status }).then(setRows); }, [status]);

  const term = q.trim().toLowerCase();
  const shown = (rows || []).filter((r) =>
    !term || `${r.requestId} ${r.customerName} ${r.email} ${r.itemTypes.join(' ')}`.toLowerCase().includes(term)
  );
  const tab = TABS.find((t) => t.id === status);

  return (
    <div className="admin-page">
      <h1 className="admin-title">Custom Requests</h1>
      <div className="admin-toolbar">
        <nav aria-label="Request status" className="admin-tabs">
          {TABS.map((t) => (
            <Link key={t.id} to={`/admin/requests?status=${t.id}`} className={`admin-tab ${t.id === status ? 'is-active' : ''}`}
              aria-current={t.id === status ? 'page' : undefined}>{t.label}</Link>
          ))}
        </nav>
        <label className="admin-search">
          <span className="visually-hidden">Search requests</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or JCSA-…" />
        </label>
      </div>
      <section className="admin-panel" aria-label={tab.label}>
        {rows === null ? <p className="admin-empty" aria-busy="true">Loading…</p> : (
          <RequestTable requests={shown}
            empty={term ? 'No requests match your search.' : status === 'new' ? 'No new requests right now.' : 'Nothing here yet.'} />
        )}
      </section>
    </div>
  );
}
