/**
 * Browser side of customer uploads (live mode):
 *   1. ask /api/upload-urls for one-time signed URLs (private bucket)
 *   2. upload each File straight to Supabase Storage
 *   3. return { folder, token, items } to include in the submission
 */
import { api, supabase } from '../lib/backend.js';
import { getFile } from '../lib/uploadStore.js';

export class MissingFilesError extends Error {}

export async function uploadCustomerFiles(purpose, metas) {
  if (!metas.length) return null;
  const missing = metas.filter((m) => !getFile(m.id));
  if (missing.length) {
    throw new MissingFilesError(
      `Please re-attach ${missing.length === 1 ? `“${missing[0].name}”` : `${missing.length} files`} — files are cleared when the page reloads.`);
  }
  const { folder, folderToken, uploads } = await api('upload-urls', {
    purpose,
    files: metas.map((m) => ({ clientId: m.id, name: m.name, type: m.type, size: m.size })),
  });
  const sb = await supabase();
  const bucket = sb.storage.from('customer-uploads');
  const items = await Promise.all(uploads.map(async (u) => {
    const meta = metas.find((m) => m.id === u.clientId);
    const { error } = await bucket.uploadToSignedUrl(u.path, u.token, getFile(meta.id), { contentType: meta.type });
    if (error) throw new Error(`“${meta.name}” couldn’t be uploaded. Please try again.`);
    return { clientId: meta.id, path: u.path, name: meta.name, type: meta.type, size: meta.size };
  }));
  return { folder, token: folderToken, items };
}

/** Admin: open a private customer file via a short-lived signed URL (live mode). */
export async function openCustomerFile(path) {
  const sb = await supabase();
  const { data, error } = await sb.storage.from('customer-uploads').createSignedUrl(path, 600);
  if (error || !data?.signedUrl) throw new Error('That file couldn’t be opened.');
  window.open(data.signedUrl, '_blank', 'noopener');
}
