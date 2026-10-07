import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { REQUESTS_CHANGED, REQUEST_STATUSES, getCustomRequest, statusLabel, updateCustomRequest } from '../services/customRequests.js';
import { getCategory } from '../data/categories.js';
import { CONTACT_METHODS } from '../data/customRequestForm.js';
import { formatDate } from '../lib/customization.js';
import { sanitizeText } from '../lib/sanitize.js';
import { useToast } from '../context/ToastContext.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import StatusPill from './StatusPill.jsx';

const stamp = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const kb = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
const CLOSED = ['completed', 'cancelled'];
const money = (v) => (v === '' || v == null ? null : Math.max(0, Math.round(Number(v) * 100) / 100));

export default function AdminRequestDetail({ requestId }) {
  const toast = useToast();
  const [r, setR] = useState(undefined);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    getCustomRequest(requestId).then((req) => {
      setR(req);
      if (req) setForm({ status: req.status, quotedPrice: req.quotedPrice ?? '', depositAmount: req.depositAmount ?? '', adminNotes: req.adminNotes });
    });
  }, [requestId]);

  if (r === undefined) return <div className="admin-page" aria-busy="true" />;
  if (!r) {
    return (
      <div className="admin-page">
        <h1 className="admin-title">Request not found</h1>
        <p className="admin-empty">No request matches {requestId}. <Link to="/admin/requests">Back to requests</Link></p>
      </div>
    );
  }

  const dirty = form.status !== r.status || String(form.quotedPrice) !== String(r.quotedPrice ?? '')
    || String(form.depositAmount) !== String(r.depositAmount ?? '') || form.adminNotes !== r.adminNotes;

  const persist = async (patch = {}) => {
    const next = { ...form, ...patch };
    setSaving(true);
    const updated = await updateCustomRequest(r.requestId, {
      status: next.status,
      quotedPrice: money(next.quotedPrice),
      depositAmount: money(next.depositAmount),
      adminNotes: sanitizeText(next.adminNotes, 4000),
    });
    setR(updated);
    setForm({ status: updated.status, quotedPrice: updated.quotedPrice ?? '', depositAmount: updated.depositAmount ?? '', adminNotes: updated.adminNotes });
    setSaving(false);
    window.dispatchEvent(new Event(REQUESTS_CHANGED));
    return updated;
  };

  const save = async (e) => {
    e.preventDefault();
    const updated = await persist();
    toast(`Saved — ${statusLabel(updated.status)}`);
  };

  const sendQuote = async () => {
    if (money(form.quotedPrice) == null) { toast('Enter a quote amount first.'); document.getElementById('rd-quote')?.focus(); return; }
    await persist({ status: 'quote-sent' });
    toast('Quote recorded — email the customer the details.');
  };
  const approve = async () => {
    if (money(form.quotedPrice) == null) { toast('Enter the approved quote before approving.'); document.getElementById('rd-quote')?.focus(); return; }
    await persist({ status: 'approved' });
    toast('Request approved');
  };
  const toProduction = async () => {
    await persist({ status: 'in-production' });
    toast('Moved into production');
  };

  const method = CONTACT_METHODS.find((m) => m.value === r.preferredContactMethod)?.label;

  return (
    <div className="admin-page">
      <Link to="/admin/requests" className="admin-back">← Custom Requests</Link>
      <div className="rd__head">
        <div>
          <h1 className="admin-title">{r.requestId}</h1>
          <p className="rd__sub">Submitted {stamp(r.createdAt)} · {r.itemTypes.map((t) => getCategory(t)?.name).join(', ')}</p>
        </div>
        <div className="rd__flags">
          <StatusPill status={r.status} />
          {r.rushRequested && <span className="status status--rush">Rush requested</span>}
        </div>
      </div>

      <div className="rd__grid">
        <div className="rd__main">
          <Panel title="Customer">
            <dl className="rd__rows">
              <Row k="Name" v={r.customerName} />
              <Row k="Email" v={<a href={`mailto:${r.email}?subject=Your custom request ${r.requestId}`}>{r.email}</a>} />
              <Row k="Phone" v={r.phone ? <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{r.phone}</a> : '—'} />
              <Row k="Prefers" v={method} />
            </dl>
          </Panel>

          <Panel title="Vision">
            <dl className="rd__rows">
              {r.visionSummary.filter((x) => x.fieldId !== 'description').map((x) => (
                <Row key={x.fieldId} k={x.label} v={<>{x.hexes && <Dots hexes={x.hexes} />}{x.value}</>} />
              ))}
            </dl>
            <p className="rd__desc">{r.description}</p>
          </Panel>

          <Panel title={`Inspiration images (${r.uploadedImages.length})`}>
            {r.uploadedImages.length ? (
              <ul role="list" className="rd__imgs">
                {r.uploadedImages.map((img) => (
                  <li key={img.id}>
                    <button type="button" onClick={() => setZoom(img)} disabled={!img.thumbUrl && !img.url}
                      aria-label={`View ${img.fileName}`}>
                      {img.thumbUrl || img.url ? <img src={img.url || img.thumbUrl} alt="" /> : <span>{img.fileName}</span>}
                    </button>
                    <span className="rd__imgmeta">{img.fileName} · {kb(img.fileSize)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="admin-empty">No images uploaded.</p>}
          </Panel>

          <Panel title="Selections">
            {r.detailSummary.map((d) => (
              <div key={d.category} className="rd__group">
                <h3>{getCategory(d.category)?.name}</h3>
                {d.items.length ? (
                  <dl className="rd__rows">
                    {d.items.map((x) => <Row key={x.fieldId} k={x.label} v={<>{x.hex && <Dots hexes={[x.hex]} />}{x.value}</>} />)}
                  </dl>
                ) : <p className="admin-empty">No specific selections.</p>}
              </div>
            ))}
            <div className="rd__group">
              <h3>Whole request</h3>
              <dl className="rd__rows">
                {r.commonSummary.map((x) => <Row key={x.fieldId} k={x.label} v={x.value} />)}
              </dl>
            </div>
          </Panel>

          <Panel title="Budget & timeline">
            <dl className="rd__rows">
              <Row k="Budget" v={r.budgetLabel} />
              <Row k="Requested date" v={r.requestedDate ? formatDate(r.requestedDate) : 'Not specified'} />
              <Row k="Rush" v={r.rushRequested ? 'Requested' : 'No'} />
              <Row k="Pricing terms" v={r.acknowledgedPricingTerms ? 'Customer acknowledged quote approval' : '—'} />
            </dl>
          </Panel>
        </div>

        <aside className="rd__side">
          <section className="admin-panel rd__actions" aria-labelledby="rd-actions">
            <h2 id="rd-actions">Actions</h2>
            <div className="rd__contact">
              <a className="btn btn--secondary btn--sm" href={`mailto:${r.email}?subject=${encodeURIComponent(`Your custom request ${r.requestId}`)}`}>Email</a>
              {r.phone && <a className="btn btn--secondary btn--sm" href={`sms:${r.phone.replace(/[^\d+]/g, '')}`}>Text</a>}
              {r.phone && <a className="btn btn--secondary btn--sm" href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>Call</a>}
            </div>
            <p className="rd__prefers">Prefers {method?.toLowerCase()}</p>
            <div className="rd__steps">
              <Button size="sm" full variant="secondary" onClick={sendQuote} disabled={saving || CLOSED.includes(r.status)}>Mark quote sent</Button>
              <Button size="sm" full onClick={approve}
                disabled={saving || ['approved', 'deposit-paid', 'in-production', 'finishing', 'ready', 'shipped', 'completed', 'cancelled'].includes(r.status)}>
                Approve request
              </Button>
              <Button size="sm" full onClick={toProduction}
                disabled={saving || !['approved', 'deposit-paid'].includes(r.status)}>
                Move into production
              </Button>
              {!['approved', 'deposit-paid'].includes(r.status) && !CLOSED.includes(r.status) && r.status !== 'in-production' && (
                <p className="cz-help">Approve the request before moving it into production.</p>
              )}
            </div>
          </section>

          <form className="admin-panel rd__manage" onSubmit={save}>
            <h2>Manage request</h2>
            <label className="cz-label" htmlFor="rd-status">Status</label>
            <div className="cz-select">
              <select id="rd-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {REQUEST_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="rd__money">
              <div>
                <label className="cz-label" htmlFor="rd-quote">Quoted price</label>
                <input id="rd-quote" className="cz-input" inputMode="decimal" placeholder="$0.00" value={form.quotedPrice}
                  onChange={(e) => setForm({ ...form, quotedPrice: e.target.value.replace(/[^\d.]/g, '') })} />
              </div>
              <div>
                <label className="cz-label" htmlFor="rd-deposit">Deposit</label>
                <input id="rd-deposit" className="cz-input" inputMode="decimal" placeholder="$0.00" value={form.depositAmount}
                  onChange={(e) => setForm({ ...form, depositAmount: e.target.value.replace(/[^\d.]/g, '') })} />
              </div>
            </div>
            <label className="cz-label" htmlFor="rd-notes">Admin notes</label>
            <textarea id="rd-notes" className="cz-input cz-input--area" rows={5} value={form.adminNotes}
              placeholder="Private notes — never shown to the customer" maxLength={4000}
              onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} />
            <Button type="submit" full disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </form>

          <section className="admin-panel">
            <h2>History</h2>
            <ol role="list" className="rd__history">
              {[...r.statusHistory].reverse().map((h, i) => (
                <li key={i}><strong>{statusLabel(h.status)}</strong><span>{stamp(h.at)}</span></li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <Modal open={!!zoom} onClose={() => setZoom(null)} title={zoom?.fileName || 'Image'}>
        {zoom && <img src={zoom.url || zoom.thumbUrl} alt={zoom.fileName} className="rd__zoom" />}
        {zoom && !zoom.url && <p className="cz-help">Preview size. Full-resolution files are stored in cloud storage once the backend is connected.</p>}
      </Modal>
    </div>
  );
}

const Panel = ({ title, children }) => (
  <section className="admin-panel"><h2>{title}</h2>{children}</section>
);
const Row = ({ k, v }) => (<div><dt>{k}</dt><dd>{v || '—'}</dd></div>);
const Dots = ({ hexes }) => (
  <span className="review__dots" aria-hidden="true">
    {hexes.map((h, i) => <span key={i} style={{ background: h || 'conic-gradient(#F4A7C0,#C9B6E4,#4FCDBB,#D4AF37,#F4A7C0)' }} />)}
  </span>
);
