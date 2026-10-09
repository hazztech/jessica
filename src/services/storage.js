/**
 * Admin image uploads (product photos, gallery).
 * Preview: resized and kept as a data URL in this browser.
 * Live: resized to WebP (full + 600px), uploaded to a public Supabase bucket;
 * only the URLs and file details are saved in the database.
 */
import { BACKEND, supabase } from '../lib/backend.js';
import { resizeImage, resizeToBlob } from '../lib/imageResize.js';
import { uid } from '../lib/localDb.js';

export async function uploadPublicImage(bucketName, file) {
  if (!BACKEND) return resizeImage(file);
  const [full, small] = await Promise.all([resizeToBlob(file, { max: 1400 }), resizeToBlob(file, { max: 600 })]);
  const sb = await supabase();
  const bucket = sb.storage.from(bucketName);
  const base = `${new Date().toISOString().slice(0, 7)}/${uid()}`;
  const ext = full.type === 'image/webp' ? 'webp' : 'jpg';
  const paths = { full: `${base}.${ext}`, small: `${base}-600.${ext}` };
  for (const [key, blob] of [['full', full.blob], ['small', small.blob]]) {
    const { error } = await bucket.upload(paths[key], blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
    if (error) throw new Error(`“${file.name}” couldn’t be uploaded.`);
  }
  const url = bucket.getPublicUrl(paths.full).data.publicUrl;
  const smallUrl = bucket.getPublicUrl(paths.small).data.publicUrl;
  return {
    url, srcSet: `${smallUrl} ${small.width}w, ${url} ${full.width}w`, path: paths.full,
    width: full.width, height: full.height, fileName: file.name, fileType: full.type,
    fileSize: full.blob.size, uploadDate: new Date().toISOString(),
  };
}
