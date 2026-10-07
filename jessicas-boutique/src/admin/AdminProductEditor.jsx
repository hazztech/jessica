import { useEffect, useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { categories } from '../data/categories.js';
import { blankProduct, deleteProduct, getProduct, saveProduct, setArchived, slugify, validateProduct } from '../services/catalog.js';
import { useToast } from '../context/ToastContext.jsx';
import { StorageFullError } from '../lib/localDb.js';
import Button from '../components/Button.jsx';
import ImageManager from './ImageManager.jsx';
import CustomizationEditor from './CustomizationEditor.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const TIMES = ['3–5 days', '1–2 weeks', '2–3 weeks', '3–4 weeks'];

export default function AdminProductEditor({ productId }) {
  const { navigate } = useRouter();
  const toast = useToast();
  const isNew = !productId;
  const [p, setP] = useState(isNew ? blankProduct() : undefined);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isNew) getProduct(productId).then((x) => setP(x ? { ...x, salePrice: x.salePrice ?? '', inventory: x.inventory ?? '' } : null));
  }, [productId, isNew]);

  if (p === undefined) return <div className="admin-page" aria-busy="true" />;
  if (p === null) return <div className="admin-page"><h1 className="admin-title">Product not found</h1><Link to="/admin/products">Back to products</Link></div>;

  const set = (patch) => {
    setP((cur) => {
      const next = { ...cur, ...patch };
      if ('name' in patch && !slugTouched) next.slug = slugify(patch.name);
      if ('category' in patch && patch.category !== cur.category) next.customization = {};
      return next;
    });
    const k = Object.keys(patch)[0];
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const madeToOrder = p.inventory === '' || p.inventory == null;

  const save = async (e) => {
    e?.preventDefault();
    const errs = validateProduct({ ...p, salePrice: p.salePrice === '' ? null : p.salePrice });
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`pe-${first}`)?.focus();
      toast('Please fix the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveProduct(p);
      toast(isNew ? `${saved.name} added` : 'Changes saved');
      if (isNew) navigate(`/admin/products/${saved.id}`, { replace: true });
      else setP({ ...saved, salePrice: saved.salePrice ?? '', inventory: saved.inventory ?? '' });
    } catch (err) {
      toast(err instanceof StorageFullError ? err.message : 'Couldn’t save. Please try again.');
    }
    setSaving(false);
  };

  const Err = ({ k }) => (errors[k] ? <p className="cz-error" id={`pe-${k}-err`} role="alert">{errors[k]}</p> : null);
  const inv = (k) => ({ 'aria-invalid': !!errors[k] || undefined, 'aria-describedby': errors[k] ? `pe-${k}-err` : undefined });

  return (
    <form className="admin-page pe" onSubmit={save} noValidate>
      <Link to="/admin/products" className="admin-back">← Products</Link>
      <div className="admin-head">
        <h1 className="admin-title">{isNew ? 'Add product' : p.name || 'Edit product'}</h1>
        {!isNew && !p.archived && p.active && <Link to={`/product/${p.slug}`} target="_blank" rel="noopener" className="atable__btn">View in store ↗</Link>}
      </div>

      <div className="pe__grid">
        <div className="pe__main">
          <section className="admin-panel pe__section">
            <h2>Details</h2>
            <label className="cz-label" htmlFor="pe-name">Product name <span className="cz-req">Required</span></label>
            <input id="pe-name" className="cz-input" value={p.name} maxLength={90} onChange={(e) => set({ name: e.target.value })} {...inv('name')} />
            <Err k="name" />

            <label className="cz-label" htmlFor="pe-slug">Web address</label>
            <div className="pe__slug"><span>/product/</span>
              <input id="pe-slug" className="cz-input" value={p.slug} maxLength={80}
                onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }); }} onBlur={() => set({ slug: slugify(p.slug) })} {...inv('slug')} />
            </div>
            <Err k="slug" />

            <label className="cz-label" htmlFor="pe-category">Category <span className="cz-req">Required</span></label>
            <div className="cz-select">
              <select id="pe-category" value={p.category} onChange={(e) => set({ category: e.target.value })} {...inv('category')}>
                <option value="">Choose a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Err k="category" />

            <label className="cz-label" htmlFor="pe-desc">Description</label>
            <textarea id="pe-desc" className="cz-input cz-input--area" rows={4} maxLength={600} value={p.description}
              onChange={(e) => set({ description: e.target.value })} placeholder="What makes this piece special?" />
          </section>

          <section className="admin-panel pe__section">
            <h2>Media</h2>
            <ImageManager value={p.images || []} onChange={(images) => set({ images })} label="Product photos"
              altHint={p.name ? `e.g. ${p.name} with crystal toe` : 'Describe the photo'} />
            <label className="cz-label" htmlFor="pe-video">Video link (optional)</label>
            <input id="pe-video" className="cz-input" value={p.video || ''} placeholder="https://…/video.mp4"
              onChange={(e) => set({ video: e.target.value.trim() || null })} />
          </section>

          <section className="admin-panel pe__section">
            <div className="pe__toggle-head">
              <h2>Customization</h2>
              <label className="cz-toggle cz-toggle--inline">
                <input type="checkbox" role="switch" checked={p.customizable} onChange={(e) => set({ customizable: e.target.checked })} />
                <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
                <span className="cz-toggle__label">Customizable</span>
              </label>
            </div>
            {p.customizable ? (
              <CustomizationEditor category={p.category} value={p.customization} onChange={(customization) => set({ customization })} />
            ) : <p className="admin-empty">Customers will buy this product as shown, with quantity only.</p>}
          </section>
        </div>

        <aside className="pe__side">
          <section className="admin-panel pe__section">
            <h2>Visibility</h2>
            {p.archived && <p className="cz-help">This product is archived. Restore it to edit visibility.</p>}
            <label className="cz-toggle">
              <input type="checkbox" role="switch" checked={p.active && !p.archived} disabled={p.archived}
                onChange={(e) => set({ active: e.target.checked })} />
              <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
              <span className="cz-toggle__label">Visible in shop</span>
            </label>
            <label className="cz-toggle">
              <input type="checkbox" role="switch" checked={p.featured} onChange={(e) => set({ featured: e.target.checked })} />
              <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
              <span className="cz-toggle__label">Featured on homepage</span>
            </label>
          </section>

          <section className="admin-panel pe__section">
            <h2>Pricing</h2>
            <div className="pe__two">
              <div>
                <label className="cz-label" htmlFor="pe-price">Price <span className="cz-req">Required</span></label>
                <div className="pe__money"><span>$</span><input id="pe-price" className="cz-input" inputMode="decimal" value={p.price}
                  onChange={(e) => set({ price: e.target.value.replace(/[^\d.]/g, '') })} {...inv('price')} /></div>
              </div>
              <div>
                <label className="cz-label" htmlFor="pe-salePrice">Sale price</label>
                <div className="pe__money"><span>$</span><input id="pe-salePrice" className="cz-input" inputMode="decimal" value={p.salePrice}
                  placeholder="None" onChange={(e) => set({ salePrice: e.target.value.replace(/[^\d.]/g, '') })} {...inv('salePrice')} /></div>
              </div>
            </div>
            <Err k="price" /><Err k="salePrice" />
          </section>

          <section className="admin-panel pe__section">
            <h2>Inventory</h2>
            <label className="cz-toggle">
              <input type="checkbox" role="switch" checked={madeToOrder}
                onChange={(e) => set({ inventory: e.target.checked ? '' : '5' })} />
              <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
              <span className="cz-toggle__label">Made to order (no stock count)</span>
            </label>
            {!madeToOrder && (
              <div className="pe__two">
                <div>
                  <label className="cz-label" htmlFor="pe-inventory">In stock</label>
                  <input id="pe-inventory" className="cz-input" inputMode="numeric" value={p.inventory}
                    onChange={(e) => set({ inventory: e.target.value.replace(/\D/g, '') })} {...inv('inventory')} />
                </div>
                <div>
                  <label className="cz-label" htmlFor="pe-low">Low-stock alert at</label>
                  <input id="pe-low" className="cz-input" inputMode="numeric" value={p.lowStockThreshold ?? 3}
                    onChange={(e) => set({ lowStockThreshold: Number(e.target.value.replace(/\D/g, '')) || 0 })} />
                </div>
              </div>
            )}
            <Err k="inventory" />
          </section>

          <section className="admin-panel pe__section">
            <h2>Production time</h2>
            <label className="visually-hidden" htmlFor="pe-time">Estimated production time</label>
            <input id="pe-time" className="cz-input" value={p.estimatedProductionTime} maxLength={40}
              onChange={(e) => set({ estimatedProductionTime: e.target.value })} />
            <div className="pe__chips">
              {TIMES.map((t) => (
                <button key={t} type="button" className={`cz-chip ${p.estimatedProductionTime === t ? 'is-selected' : ''}`}
                  onClick={() => set({ estimatedProductionTime: t })}>{t}</button>
              ))}
            </div>
          </section>

          {!isNew && (
            <section className="admin-panel pe__section">
              <h2>Archive or delete</h2>
              <Button variant="secondary" full type="button"
                onClick={async () => { const x = await setArchived(p.id, !p.archived); setP({ ...x, salePrice: x.salePrice ?? '', inventory: x.inventory ?? '' }); toast(x.archived ? 'Archived' : 'Restored'); }}>
                {p.archived ? 'Restore product' : 'Archive product'}
              </Button>
              <button type="button" className="pe__delete" onClick={() => setConfirmDelete(true)}>Delete permanently</button>
            </section>
          )}
        </aside>
      </div>

      <div className="pe__bar">
        <Link to="/admin/products" className="atable__btn">Cancel</Link>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}</Button>
      </div>

      <ConfirmDialog open={confirmDelete} title="Delete product permanently?" confirmLabel="Delete" danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => { await deleteProduct(p.id); toast(`${p.name} deleted`); navigate('/admin/products', { replace: true }); }}>
        <p><strong>{p.name}</strong> will be removed for good. Archive instead if you might sell it again.</p>
      </ConfirmDialog>
    </form>
  );
}
