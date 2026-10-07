import { effectivePrice } from './format.js';

/** Filters live in the URL (?category=shoes,ties&color=mint&max=120&sort=price-asc) so they're shareable. */
const LIST_KEYS = ['category', 'color', 'size', 'occasion'];

export function readFilters(query) {
  const f = { sort: query.get('sort') || 'featured', min: null, max: null };
  for (const k of LIST_KEYS) f[k] = (query.get(k) || '').split(',').filter(Boolean);
  if (query.get('min')) f.min = Number(query.get('min'));
  if (query.get('max')) f.max = Number(query.get('max'));
  return f;
}

export function writeFilters(f) {
  const q = new URLSearchParams();
  for (const k of LIST_KEYS) if (f[k]?.length) q.set(k, f[k].join(','));
  if (f.min != null) q.set('min', String(f.min));
  if (f.max != null) q.set('max', String(f.max));
  if (f.sort && f.sort !== 'featured') q.set('sort', f.sort);
  const s = q.toString();
  return s ? `/shop?${s}` : '/shop';
}

export const activeCount = (f) =>
  LIST_KEYS.reduce((n, k) => n + f[k].length, 0) + (f.min != null || f.max != null ? 1 : 0);

export const emptyFilters = (sort = 'featured') => ({ category: [], color: [], size: [], occasion: [], min: null, max: null, sort });

export function applyFilters(products, f) {
  const out = products.filter((p) => {
    const price = effectivePrice(p);
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.color.length && !(p.colors || []).some((c) => f.color.includes(c))) return false;
    if (f.size.length && !(p.sizes || []).some((s) => f.size.includes(s))) return false;
    if (f.occasion.length && !(p.occasions || []).some((o) => f.occasion.includes(o))) return false;
    if (f.min != null && price < f.min) return false;
    if (f.max != null && price > f.max) return false;
    return true;
  });
  const by = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || (b.popularity || 0) - (a.popularity || 0),
    newest: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || b.id.localeCompare(a.id),
    'price-asc': (a, b) => effectivePrice(a) - effectivePrice(b),
    'price-desc': (a, b) => effectivePrice(b) - effectivePrice(a),
    popular: (a, b) => (b.popularity || 0) - (a.popularity || 0),
  }[f.sort] || (() => 0);
  return out.sort(by);
}

export const priceBounds = (products) => {
  const prices = products.map(effectivePrice);
  return { lo: 0, hi: Math.max(50, Math.ceil(Math.max(0, ...prices) / 10) * 10) };
};
