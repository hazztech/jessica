/**
 * Gallery service (gallery table) — completed custom pieces shown on /gallery.
 * Preview mode stores resized images in this browser.
 */
import { collection, uid } from '../lib/localDb.js';
import { seedGallery } from '../data/seedGallery.js';

const db = collection('jcsa-gallery-v2', () => seedGallery);

export async function listGallery() { return db.all(); }
export async function saveGalleryItem(item) {
  const now = new Date().toISOString();
  return db.upsert({ createdAt: now, ...item, id: item.id || uid('g-'), updatedAt: now });
}
export async function deleteGalleryItem(id) { db.remove(id); }
export const publishedGallery = () =>
  db.all().filter((g) => g.published && g.images?.length)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)));
