/**
 * Product catalog service.
 *   Preview: stored in this browser (seeded from data/seedProducts.js).
 *   Live:    Supabase `products` + `product_images`. The storefront reads a cache
 *            loaded once at startup (initCatalog) so pages stay instant.
 */
import { collection, uid } from '../lib/localDb.js';
import { BACKEND, check, supabase } from '../lib/backend.js';
import { productFromRow, productImageRows, productToRow } from '../lib/mappers.js';
import { seedProducts } from '../data/seedProducts.js';

export const LOW_STOCK_DEFAULT = 3;
const SELECT = '*, product_images(*)';

const local = collection('jcsa-catalog-v2', () =>
  seedProducts.map((p) => ({ archived: false, lowStockThreshold: LOW_STOCK_DEFAULT, ...p })));

let cache = null;
const announce = () => window.dispatchEvent(new CustomEvent('jcsa:data', { detail: 'catalog' }));

/** Synchronous access used by storefront pages */
export const catalog = {
  all: () => (BACKEND ? cache || [] : local.all()),
  get: (id) => catalog.all().find((p) => p.id === id) || null,
};

/** Load the catalog before the first render (live mode). Falls back to seed data if offline. */
export async function initCatalog() {
  if (!BACKEND) return;
  try {
    const sb = await supabase();
    cache = check(await sb.from('products').select(SELECT).order('created_at', { ascending: false })).map(productFromRow);
  } catch (err) {
    console.error('Catalog unavailable, showing built-in products', err);
    cache = seedProducts;
  }
}

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

export function blankProduct() {
  const now = new Date().toISOString();
  return {
    id: uid('p-'), name: '', slug: '', description: '', category: '',
    price: '', salePrice: null, images: [], video: null,
    featured: false, customizable: true, active: true, archived: false,
    inventory: null, lowStockThreshold: LOW_STOCK_DEFAULT,
    sizes: [], colors: [], occasions: [], popularity: 0,
    estimatedProductionTime: '1–2 weeks',
    customization: {}, createdAt: now, updatedAt: now, isNew: true,
  };
}

/** Admin list — includes hidden and archived products (RLS allows admins to see them) */
export async function listProducts() {
  if (!BACKEND) return local.all();
  const sb = await supabase();
  cache = check(await sb.from('products').select(SELECT).order('created_at', { ascending: false }), 'Could not load products').map(productFromRow);
  return cache;
}

export async function getProduct(id) {
  if (!BACKEND) return local.get(id);
  const sb = await supabase();
  const row = check(await sb.from('products').select(SELECT).eq('id', id).maybeSingle(), 'Could not load the product');
  return row ? productFromRow(row) : null;
}

export function validateProduct(p, all = catalog.all()) {
  const e = {};
  if (!p.name.trim()) e.name = 'Enter a product name.';
  if (!p.category) e.category = 'Choose a category.';
  const price = Number(p.price);
  if (!(price > 0)) e.price = 'Enter a price greater than $0.';
  if (p.salePrice !== null && p.salePrice !== '' && !(Number(p.salePrice) > 0 && Number(p.salePrice) < price)) {
    e.salePrice = 'Sale price must be lower than the regular price.';
  }
  if (p.inventory !== null && p.inventory !== '' && !(Number.isInteger(Number(p.inventory)) && Number(p.inventory) >= 0)) {
    e.inventory = 'Inventory must be 0 or more.';
  }
  const slug = p.slug || slugify(p.name);
  if (!slug) { if (p.name.trim()) e.slug = 'Enter a web address.'; }
  else if (all.some((x) => x.slug === slug && x.id !== p.id)) e.slug = 'Another product already uses this URL.';
  return e;
}

function normalize(p) {
  const { isNew, ...rest } = p;
  return {
    ...rest,
    name: p.name.trim(),
    slug: p.slug ? slugify(p.slug) : slugify(p.name),
    price: Math.round(Number(p.price) * 100) / 100,
    salePrice: p.salePrice === '' || p.salePrice == null ? null : Math.round(Number(p.salePrice) * 100) / 100,
    inventory: p.inventory === '' || p.inventory == null ? null : Number(p.inventory),
    updatedAt: new Date().toISOString(),
  };
}

export async function saveProduct(p) {
  const clean = normalize(p);
  if (!BACKEND) return local.upsert(clean);
  const sb = await supabase();
  try {
    check(await sb.from('products').upsert(productToRow(clean)), 'Could not save the product');
  } catch (err) {
    if (err.code === '23505') throw new Error('Another product already uses this web address.');
    throw err;
  }
  check(await sb.from('product_images').delete().eq('product_id', clean.id), 'Could not update photos');
  if (clean.images?.length) check(await sb.from('product_images').insert(productImageRows(clean.id, clean.images)), 'Could not save photos');
  const saved = await getProduct(clean.id);
  await listProducts();
  announce();
  return saved;
}

export async function setArchived(id, archived) {
  if (!BACKEND) {
    const p = local.get(id);
    return local.upsert({ ...p, archived, active: archived ? false : p.active, updatedAt: new Date().toISOString() });
  }
  const sb = await supabase();
  const patch = archived ? { archived: true, active: false } : { archived: false };
  check(await sb.from('products').update(patch).eq('id', id), 'Could not update the product');
  const saved = await getProduct(id);
  await listProducts();
  announce();
  return saved;
}

export async function deleteProduct(id) {
  if (!BACKEND) return local.remove(id);
  const sb = await supabase();
  const p = await getProduct(id);
  check(await sb.from('products').delete().eq('id', id), 'Could not delete the product');
  const paths = (p?.images || []).filter((i) => i.path).flatMap((i) => [i.path, i.path.replace(/\.(\w+)$/, '-600.$1')]);
  if (paths.length) await sb.storage.from('product-images').remove(paths);
  await listProducts();
  announce();
}

export const isLowStock = (p) =>
  !p.archived && p.inventory != null && p.inventory <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT);
