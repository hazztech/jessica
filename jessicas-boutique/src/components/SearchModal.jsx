import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import ProductImage from './ProductImage.jsx';
import { Link } from '../lib/router.jsx';
import { activeProducts } from '../data/products.js';
import { categories } from '../data/categories.js';
import { formatPrice, effectivePrice } from '../lib/format.js';
import { SearchIcon } from './icons.jsx';

export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!term) return [];
    return activeProducts()
      .filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [term]);

  const close = () => { setQ(''); onClose(); };

  return (
    <Modal open={open} onClose={close} title="Search the shop" hideTitle variant="top" className="search">
      <div className="container search__inner">
        <label className="search__field">
          <SearchIcon />
          <span className="visually-hidden">Search products</span>
          <input data-autofocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search shoes, tumblers, ties…" autoComplete="off" />
        </label>

        {!term && (
          <div className="search__chips">
            <p className="search__hint">Browse a collection</p>
            <ul role="list">
              {categories.map((c) => (
                <li key={c.id}><Link to={`/shop?category=${c.slug}`} onClick={close} className="chip">{c.name}</Link></li>
              ))}
            </ul>
          </div>
        )}

        {term && (
          <div aria-live="polite">
            {results.length ? (
              <ul role="list" className="search__results">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.slug}`} onClick={close} className="search__result">
                      <span className="search__thumb"><ProductImage image={p.images[0]} category={p.category} /></span>
                      <span className="search__name">{p.name}</span>
                      <span className="search__price">{formatPrice(effectivePrice(p))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="search__empty">
                <p>No products match “{q}”.</p>
                <p>Jessica can make it for you — <Link to="/custom-orders" onClick={close}>start a custom order</Link>.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
