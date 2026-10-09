/**
 * Gallery service — finished pieces shown on /gallery.
 *   Preview: this browser.  Live: Supabase `gallery` table + public `gallery` bucket.
 */
import { collection, uid } from '../lib/localDb.js';
import { BACKEND, check, supabase } from '../lib/backend.js';
import { galleryFromRow, galleryToRow } from '../lib/mappers.js';
import { seedGallery } from '../data/seedGallery.js';

const local = collection('jcsa-gallery-v2', () => seedGallery);
let cache = null;
const announce = () => window.dispatchEvent(new CustomEvent('jcsa:data', { detail: 'gallery' }));
const sortItems = (list) => list.slice().sort((a, b) =>
  Number(b.featured) - Number(a.featured) || String(b.createdAt).localeCompare(String(a.createdAt)));

export async function initGallery() {
  if (!BACKEND) return;
  try {
    const sb = await supabase();
    cache = check(await sb.from('gallery').select('*').eq('published', true)).map(galleryFromRow);
  } catch (err) {
    console.error('Gallery unavailable, showing built-in pieces', err);
    cache = seedGallery;
  }
}

export async function listGallery() {
  if (!BACKEND) return local.all();
  const sb = await supabase();
  return check(await sb.from('gallery').select('*').order('created_at', { ascending: false }), 'Could not load the gallery').map(galleryFromRow);
}

export async function saveGalleryItem(item) {
  const now = new Date().toISOString();
  const record = { createdAt: now, ...item, id: item.id || uid('g-'), updatedAt: now };
  if (!BACKEND) return local.upsert(record);
  const sb = await supabase();
  const row = check(await sb.from('gallery').upsert(galleryToRow(record)).select('*').single(), 'Could not save the gallery item');
  await initGallery();
  announce();
  return galleryFromRow(row);
}

export async function deleteGalleryItem(id) {
  if (!BACKEND) return local.remove(id);
  const sb = await supabase();
  const row = check(await sb.from('gallery').select('images').eq('id', id).maybeSingle());
  check(await sb.from('gallery').delete().eq('id', id), 'Could not delete the gallery item');
  const paths = (row?.images || []).filter((i) => i.path).flatMap((i) => [i.path, i.path.replace(/\.(\w+)$/, '-600.$1')]);
  if (paths.length) await sb.storage.from('gallery').remove(paths);
  await initGallery();
  announce();
}

export const publishedGallery = () =>
  sortItems((BACKEND ? cache || [] : local.all()).filter((g) => g.published && g.images?.length));
