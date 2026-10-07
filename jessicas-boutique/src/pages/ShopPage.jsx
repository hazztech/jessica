import { useMemo, useState } from 'react';
import { useRouter } from '../lib/router.jsx';
import { activeProducts } from '../data/products.js';
import { categories, getCategory } from '../data/categories.js';
import { SHOP_COLORS, SORTS } from '../data/shop.js';
import { activeCount, applyFilters, emptyFilters, priceBounds, readFilters, writeFilters } from '../lib/shopFilters.js';
import { formatAddon } from '../lib/format.js';
import ShopFilters from '../components/ShopFilters.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import Ornament from '../components/Ornament.jsx';
import { CloseIcon } from '../components/icons.jsx';
import '../components/customization/Customization.css';
import './ShopPage.css';

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
  </svg>
);

export default function ShopPage() {
  const { query, navigate } = useRouter();
  const all = activeProducts();
  const bounds = useMemo(() => priceBounds(all), [all.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const filters = readFilters(query);
  const results = applyFilters(all, filters);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const draftCount = applyFilters(all, draft).length;

  const setFilters = (f) => navigate(writeFilters(f), { replace: true, scroll: false });
  const openSheet = () => { setDraft(filters); setSheetOpen(true); };

  // counts per category for the current non-category filters
  const counts = useMemo(() => {
    const base = applyFilters(all, { ...filters, category: [] });
    return { category: Object.fromEntries(categories.map((c) => [c.id, base.filter((p) => p.category === c.id).length])) };
  }, [query.toString()]); // eslint-disable-line react-hooks/exhaustive-deps
  const draftCounts = useMemo(() => {
    const base = applyFilters(all, { ...draft, category: [] });
    return { category: Object.fromEntries(categories.map((c) => [c.id, base.filter((p) => p.category === c.id).length])) };
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips = [
    ...filters.category.map((v) => ({ key: 'category', v, label: getCategory(v)?.name })),
    ...filters.color.map((v) => ({ key: 'color', v, label: SHOP_COLORS.find((c) => c.value === v)?.label })),
    ...filters.size.map((v) => ({ key: 'size', v, label: v })),
    ...filters.occasion.map((v) => ({ key: 'occasion', v, label: v })),
    ...(filters.min != null || filters.max != null
      ? [{ key: 'price', label: `${formatAddon(filters.min ?? bounds.lo)}–${filters.max != null ? formatAddon(filters.max) : `${formatAddon(bounds.hi)}+`}` }]
      : []),
  ];
  const removeChip = (c) =>
    setFilters(c.key === 'price' ? { ...filters, min: null, max: null } : { ...filters, [c.key]: filters[c.key].filter((x) => x !== c.v) });
  const n = activeCount(filters);
  const single = filters.category.length === 1 ? getCategory(filters.category[0]) : null;

  return (
    <div className="shop">
      <header className="shop__head">
        <div className="container">
          <h1>{single ? single.name : 'Shop All Collections'}</h1>
          <Ornament />
          <p>{single ? single.description : 'Custom shoes, apparel and accessories made just for you.'}</p>
        </div>
      </header>

      {/* Mobile / tablet toolbar */}
      <div className="shop__bar">
        <div className="container shop__bar-inner">
          <button type="button" className="shop__filter-btn" onClick={openSheet} aria-haspopup="dialog">
            <FilterIcon /> Filter &amp; Sort
            {n > 0 && <span className="shop__badge" aria-label={`${n} active`}>{n}</span>}
          </button>
          <p className="shop__count" aria-live="polite">{results.length} {results.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="container shop__layout">
        <aside className="shop__side" aria-label="Filters">
          <div className="shop__side-head">
            <h2>Filters</h2>
            {n > 0 && <button type="button" className="shop__clear" onClick={() => setFilters(emptyFilters(filters.sort))}>Clear all</button>}
          </div>
          <ShopFilters filters={filters} onChange={setFilters} bounds={bounds} counts={counts} idPrefix="side" />
        </aside>

        <section className="shop__main" aria-label="Products">
          <div className="shop__top">
            <p className="shop__count shop__count--desk" aria-live="polite">{results.length} {results.length === 1 ? 'item' : 'items'}</p>
            <label className="shop__sort">
              <span>Sort by</span>
              <span className="cz-select">
                <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </span>
            </label>
          </div>

          {chips.length > 0 && (
            <ul role="list" className="shop__chips" aria-label="Active filters">
              {chips.map((c) => (
                <li key={`${c.key}-${c.v || ''}`}>
                  <button type="button" className="shop__chip" onClick={() => removeChip(c)} aria-label={`Remove filter ${c.label}`}>
                    {c.label}<CloseIcon size={14} />
                  </button>
                </li>
              ))}
              <li><button type="button" className="shop__clear" onClick={() => setFilters(emptyFilters(filters.sort))}>Clear all</button></li>
            </ul>
          )}

          {results.length ? (
            <ul role="list" className="shop__grid">
              {results.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
            </ul>
          ) : (
            <div className="shop__empty">
              <h2>No matches yet</h2>
              <p>Try removing a filter — or ask Jessica to create exactly what you’re picturing.</p>
              <div className="shop__empty-ctas">
                <Button variant="secondary" onClick={() => setFilters(emptyFilters(filters.sort))}>Clear filters</Button>
                <Button to="/custom-orders">Start a custom order</Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter & Sort" variant="sheet" className="shop__sheet"
        footer={
          <div className="shop__sheet-foot">
            <Button variant="ghost" onClick={() => setDraft(emptyFilters('featured'))}>Clear all</Button>
            <Button onClick={() => { setFilters(draft); setSheetOpen(false); }}>
              Show {draftCount} {draftCount === 1 ? 'result' : 'results'}
            </Button>
          </div>
        }>
        <ShopFilters filters={draft} onChange={setDraft} bounds={bounds} counts={draftCounts} showSort idPrefix="sheet" />
      </Modal>
    </div>
  );
}
