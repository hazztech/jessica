import { categories } from '../data/categories.js';
import { SHOP_COLORS, SHOP_OCCASIONS, SHOP_SIZES, SORTS } from '../data/shop.js';
import PriceRange from './PriceRange.jsx';

/** Filter controls — used in the desktop sidebar and inside the mobile drawer. */
export default function ShopFilters({ filters, onChange, bounds, counts, showSort = false, idPrefix = 'f' }) {
  const toggle = (key, v) => {
    const list = filters[key];
    onChange({ ...filters, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] });
  };

  return (
    <div className="sf">
      {showSort && (
        <fieldset className="sf__group">
          <legend>Sort by</legend>
          <div className="sf__radios">
            {SORTS.map((s) => (
              <label key={s.value} className={`sf__radio ${filters.sort === s.value ? 'is-on' : ''}`}>
                <input type="radio" name={`${idPrefix}-sort`} checked={filters.sort === s.value}
                  onChange={() => onChange({ ...filters, sort: s.value })} />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="sf__group">
        <legend>Category</legend>
        <ul role="list" className="sf__list">
          {categories.map((c) => (
            <li key={c.id}>
              <label className="sf__check">
                <input type="checkbox" checked={filters.category.includes(c.id)} onChange={() => toggle('category', c.id)} />
                <span className="sf__box" aria-hidden="true" />
                <span className="sf__name">{c.name}</span>
                <span className="sf__count">{counts.category[c.id] || 0}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="sf__group">
        <legend>Price</legend>
        <PriceRange lo={bounds.lo} hi={bounds.hi} min={filters.min} max={filters.max}
          onChange={(min, max) => onChange({ ...filters, min, max })} />
      </fieldset>

      <fieldset className="sf__group">
        <legend>Color</legend>
        <div className="cz-swatches">
          {SHOP_COLORS.map((c) => {
            const on = filters.color.includes(c.value);
            return (
              <label key={c.value} className={`cz-swatch ${on ? 'is-selected' : ''}`} title={c.label}>
                <input type="checkbox" checked={on} onChange={() => toggle('color', c.value)} aria-label={c.label} />
                <span className="cz-swatch__dot" style={{ '--swatch': c.hex }} aria-hidden="true" />
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="sf__group">
        <legend>Size</legend>
        <div className="cz-chips">
          {SHOP_SIZES.map((s) => (
            <label key={s} className={`cz-chip ${filters.size.includes(s) ? 'is-selected' : ''}`}>
              <input type="checkbox" checked={filters.size.includes(s)} onChange={() => toggle('size', s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="sf__group">
        <legend>Occasion</legend>
        <div className="cz-chips">
          {SHOP_OCCASIONS.map((o) => (
            <label key={o} className={`cz-chip ${filters.occasion.includes(o) ? 'is-selected' : ''}`}>
              <input type="checkbox" checked={filters.occasion.includes(o)} onChange={() => toggle('occasion', o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
