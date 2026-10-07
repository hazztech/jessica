import { useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { categories, getCategory } from '../data/categories.js';
import { deleteProduct, isLowStock, listProducts, setArchived } from '../services/catalog.js';
import { useToast } from '../context/ToastContext.jsx';
import { useLiveData, money } from './useLiveData.js';
import ProductImage from '../components/ProductImage.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'archived', label: 'Archived' },
  { id: 'low', label: 'Low inventory' },
  { id: 'all', label: 'All' },
];

export default function AdminProducts() {
  const { query } = useRouter();
  const toast = useToast();
  const filter = FILTERS.some((f) => f.id === query.get('filter')) ? query.get('filter') : 'active';
  const [products] = useLiveData(() => listProducts());
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [toDelete, setToDelete] = useState(null);
  if (!products) return <div className="admin-page" aria-busy="true" />;

  const test = {
    active: (p) => !p.archived && p.active,
    hidden: (p) => !p.archived && !p.active,
    archived: (p) => p.archived,
    low: isLowStock,
    all: () => true,
  }[filter];
  const term = q.trim().toLowerCase();
  const shown = products.filter(test)
    .filter((p) => !cat || p.category === cat)
    .filter((p) => !term || `${p.name} ${p.slug}`.toLowerCase().includes(term));

  const archive = async (p, on) => {
    await setArchived(p.id, on);
    toast(on ? `${p.name} archived — hidden from the shop` : `${p.name} restored (hidden until you make it visible)`);
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="admin-title">Products</h1>
        <Link className="btn btn--primary btn--sm" to="/admin/products/new">Add product</Link>
      </div>
      <div className="admin-toolbar">
        <nav aria-label="Product filter" className="admin-tabs">
          {FILTERS.map((f) => (
            <Link key={f.id} to={`/admin/products?filter=${f.id}`} className={`admin-tab ${f.id === filter ? 'is-active' : ''}`}
              aria-current={f.id === filter ? 'page' : undefined}>
              {f.label}<span className="admin-tab__n">{products.filter({
                active: (p) => !p.archived && p.active, hidden: (p) => !p.archived && !p.active,
                archived: (p) => p.archived, low: isLowStock, all: () => true }[f.id]).length}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-filters">
          <label className="admin-search">
            <span className="visually-hidden">Search products</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
          </label>
          <label className="admin-select">
            <span className="visually-hidden">Category</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      <section className="admin-panel">
        {shown.length === 0 ? (
          <p className="admin-empty">No products here. <Link to="/admin/products/new">Add a product</Link></p>
        ) : (
          <div className="atable-wrap" tabIndex={0} role="region" aria-label="Products table">
            <table className="atable">
              <thead>
                <tr>
                  <th scope="col"><span className="visually-hidden">Photo</span></th>
                  <th scope="col">Product</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Inventory</th>
                  <th scope="col">Customizable</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td className="atable__thumb"><ProductImage image={p.images?.[0]} category={p.category} /></td>
                    <th scope="row">
                      <Link to={`/admin/products/${p.id}`} className="atable__key">{p.name}</Link>
                      <span className="atable__sub">/{p.slug}</span>
                    </th>
                    <td>{getCategory(p.category)?.name}</td>
                    <td className="atable__num">
                      {p.salePrice != null ? (<><s className="atable__sub">{money(p.price)}</s> {money(p.salePrice)}</>) : money(p.price)}
                    </td>
                    <td>
                      {p.inventory == null ? <span className="atable__sub">Made to order</span> : p.inventory}
                      {isLowStock(p) && <span className="atable__flag">Low</span>}
                    </td>
                    <td>{p.customizable ? 'Yes' : 'No'}</td>
                    <td>
                      <span className={`status ${p.archived ? 'status--cancelled' : p.active ? 'pstatus--live' : 'pstatus--hidden'}`}>
                        {p.archived ? 'Archived' : p.active ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="atable__actions">
                      <Link to={`/admin/products/${p.id}`} className="atable__btn">Edit</Link>
                      <button type="button" className="atable__btn" onClick={() => archive(p, !p.archived)}>
                        {p.archived ? 'Restore' : 'Archive'}
                      </button>
                      <button type="button" className="atable__btn atable__btn--danger" onClick={() => setToDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog open={!!toDelete} title="Delete product permanently?" confirmLabel="Delete" danger
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await deleteProduct(toDelete.id); toast(`${toDelete.name} deleted`); setToDelete(null); }}>
        <p><strong>{toDelete?.name}</strong> will be removed for good. Past orders keep their own copy of the details.</p>
        <p className="cz-help">Tip: Archive hides a product from the shop but keeps it for later.</p>
      </ConfirmDialog>
    </div>
  );
}
