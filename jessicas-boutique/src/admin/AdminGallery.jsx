import { useState } from 'react';
import { categories, getCategory } from '../data/categories.js';
import { deleteGalleryItem, listGallery, saveGalleryItem } from '../services/gallery.js';
import { useToast } from '../context/ToastContext.jsx';
import { StorageFullError } from '../lib/localDb.js';
import { sanitizeText } from '../lib/sanitize.js';
import { useLiveData, shortDate } from './useLiveData.js';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import ImageManager from './ImageManager.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const blank = () => ({ title: '', category: '', description: '', images: [], featured: false, published: true });

export default function AdminGallery() {
  const toast = useToast();
  const [items] = useLiveData(() => listGallery());
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('');
  const [toDelete, setToDelete] = useState(null);
  if (!items) return <div className="admin-page" aria-busy="true" />;

  const open = (item) => { setErrors({}); setEditing(item ? { ...item } : blank()); };
  const save = async () => {
    const e = {};
    if (!editing.images.length) e.images = 'Upload at least one photo.';
    if (!editing.category) e.category = 'Choose a category.';
    if (!editing.title.trim()) e.title = 'Give this piece a short title.';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      await saveGalleryItem({ ...editing, title: sanitizeText(editing.title, 80), description: sanitizeText(editing.description, 400) });
      toast(editing.id ? 'Gallery item updated' : 'Added to the gallery');
      setEditing(null);
    } catch (err) {
      toast(err instanceof StorageFullError ? err.message : 'Couldn’t save. Please try again.');
    }
  };

  const shown = items.filter((i) => !filter || i.category === filter);
  const counts = Object.fromEntries(categories.map((c) => [c.id, items.filter((i) => i.category === c.id).length]));

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="admin-title">Gallery</h1>
        <Button size="sm" onClick={() => open(null)}>Upload a creation</Button>
      </div>
      <div className="admin-toolbar">
        <nav className="admin-tabs" aria-label="Gallery category">
          <button type="button" className={`admin-tab ${!filter ? 'is-active' : ''}`} aria-pressed={!filter} onClick={() => setFilter('')}>
            All<span className="admin-tab__n">{items.length}</span>
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" className={`admin-tab ${filter === c.id ? 'is-active' : ''}`}
              aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.name}<span className="admin-tab__n">{counts[c.id]}</span>
            </button>
          ))}
        </nav>
      </div>

      {shown.length === 0 ? (
        <div className="admin-panel gal-empty">
          <p>{items.length ? 'No pieces in this category yet.' : 'Show off finished custom pieces — they appear on the public Gallery page.'}</p>
          <Button size="sm" onClick={() => open(filter ? { ...blank(), category: filter } : null)}>Upload a creation</Button>
        </div>
      ) : (
        <ul role="list" className="gal-grid">
          {shown.map((g) => (
            <li key={g.id} className="gal-card">
              <button type="button" className="gal-card__img" onClick={() => open(g)} aria-label={`Edit ${g.title}`}>
                <img src={g.images[0]?.url} alt="" loading="lazy" />
                {g.images.length > 1 && <span className="gal-card__count">+{g.images.length - 1}</span>}
                {!g.published && <span className="gal-card__hidden">Hidden</span>}
                {g.featured && <span className="gal-card__feat">Featured</span>}
              </button>
              <div className="gal-card__body">
                <strong>{g.title}</strong>
                <span>{getCategory(g.category)?.name} · {shortDate(g.createdAt)}</span>
              </div>
              <div className="gal-card__actions">
                <button type="button" className="atable__btn" onClick={() => open(g)}>Edit</button>
                <button type="button" className="atable__btn" onClick={() => saveGalleryItem({ ...g, published: !g.published })}>
                  {g.published ? 'Hide' : 'Publish'}
                </button>
                <button type="button" className="atable__btn atable__btn--danger" onClick={() => setToDelete(g)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit gallery item' : 'Upload a creation'}
        variant="right" className="gal-modal"
        footer={<div className="confirm__actions"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>{editing?.id ? 'Save changes' : 'Add to gallery'}</Button></div>}>
        {editing && (
          <div className="gal-form">
            <ImageManager value={editing.images} max={6} label="Photos"
              onChange={(images) => { setEditing({ ...editing, images }); setErrors((e) => ({ ...e, images: undefined })); }}
              altHint="e.g. Mint crystal sneakers with satin bows" />
            {errors.images && <p className="cz-error" role="alert">{errors.images}</p>}

            <fieldset className="cz-fieldset" aria-describedby={errors.category ? 'gal-cat-err' : undefined}>
              <legend className="cz-label">Category <span className="cz-req">Required</span></legend>
              <div className="cz-chips">
                {categories.map((c) => (
                  <label key={c.id} className={`cz-chip ${editing.category === c.id ? 'is-selected' : ''}`}>
                    <input type="radio" name="gal-cat" checked={editing.category === c.id}
                      onChange={() => { setEditing({ ...editing, category: c.id }); setErrors((e) => ({ ...e, category: undefined })); }} />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
              {errors.category && <p className="cz-error" id="gal-cat-err" role="alert">{errors.category}</p>}
            </fieldset>

            <div>
              <label className="cz-label" htmlFor="gal-title">Title <span className="cz-req">Required</span></label>
              <input id="gal-title" className="cz-input" value={editing.title} maxLength={80}
                placeholder="e.g. Quinceañera crystal heels" aria-invalid={!!errors.title || undefined}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              {errors.title && <p className="cz-error" role="alert">{errors.title}</p>}
            </div>
            <div>
              <label className="cz-label" htmlFor="gal-desc">Description</label>
              <textarea id="gal-desc" className="cz-input cz-input--area" rows={3} maxLength={400} value={editing.description}
                placeholder="Optional — the story, colors or occasion"
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <label className="cz-toggle">
              <input type="checkbox" role="switch" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
              <span className="cz-toggle__label">Show on the public gallery</span>
            </label>
            <label className="cz-toggle">
              <input type="checkbox" role="switch" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
              <span className="cz-toggle__label">Feature this piece</span>
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!toDelete} title="Delete from gallery?" confirmLabel="Delete" danger
        onCancel={() => setToDelete(null)}
        onConfirm={async () => { await deleteGalleryItem(toDelete.id); toast('Removed from the gallery'); setToDelete(null); }}>
        <p><strong>{toDelete?.title}</strong> and its photos will be removed.</p>
      </ConfirmDialog>
    </div>
  );
}
