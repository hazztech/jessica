/**
 * Product catalog service (products, productImages, productCustomizationOptions).
 * Preview mode: stored in this browser. Production: swap for API calls.
 */
import { collection, uid } from '../lib/localDb.js';
import { seedProducts } from '../data/seedProducts.js';

export const LOW_STOCK_DEFAULT = 3;

// v2: catalog rebuilt around Jessica's product photography
export const catalog = collection('jcsa-catalog-v2', () =>
  seedProducts.map((p) => ({ archived: false, lowStockThreshold: LOW_STOCK_DEFAULT, ...p }))
);

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
    customization: {}, createdAt: now, updatedAt: now,
  };
}

export async function listProducts() { return catalog.all(); }
export async function getProduct(id) { return catalog.get(id); }

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

export async function saveProduct(p) {
  const clean = {
    ...p,
    name: p.name.trim(),
    slug: p.slug ? slugify(p.slug) : slugify(p.name),
    price: Math.round(Number(p.price) * 100) / 100,
    salePrice: p.salePrice === '' || p.salePrice == null ? null : Math.round(Number(p.salePrice) * 100) / 100,
    inventory: p.inventory === '' || p.inventory == null ? null : Number(p.inventory),
    updatedAt: new Date().toISOString(),
  };
  return catalog.upsert(clean);
}

export async function setArchived(id, archived) {
  const p = catalog.get(id);
  return catalog.upsert({ ...p, archived, active: archived ? false : p.active, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id) { catalog.remove(id); }

export const isLowStock = (p) =>
  !p.archived && p.inventory != null && p.inventory <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT);
