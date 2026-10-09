/**
 * Customer file uploads (custom requests, cart customizations).
 * Files go straight from the browser to the PRIVATE `customer-uploads` bucket
 * using one-time signed upload URLs. The folder name is HMAC-signed so a later
 * submission can prove its files came from a folder this server issued.
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { db, HttpError } from './supabase.js';

export const UPLOAD_BUCKET = 'customer-uploads';
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const LIMITS = { request: 10, order: 20 };

const secret = () => process.env.UPLOAD_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const signFolder = (folder) => createHmac('sha256', secret()).update(folder).digest('hex');

export function verifyFolder(folder, token) {
  if (!folder || !token || !/^(request|order)\/\d{4}-\d{2}\/[0-9a-f-]{36}$/.test(folder)) return false;
  const a = Buffer.from(signFolder(folder));
  const b = Buffer.from(String(token));
  return a.length === b.length && timingSafeEqual(a, b);
}

const safeName = (name) =>
  String(name).normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(-80) || 'file';

export function newFolder(purpose) {
  const d = new Date();
  return `${purpose}/${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}`;
}

export function checkFiles(purpose, files) {
  if (!LIMITS[purpose]) throw new HttpError(400, 'Unknown upload purpose.');
  if (!Array.isArray(files) || !files.length) throw new HttpError(400, 'No files to upload.');
  if (files.length > LIMITS[purpose]) throw new HttpError(400, `You can upload up to ${LIMITS[purpose]} files.`);
  for (const f of files) {
    if (!ALLOWED_TYPES.includes(f.type)) throw new HttpError(400, `“${f.name}” isn’t a supported file type.`);
    if (!(f.size > 0) || f.size > MAX_FILE_BYTES) throw new HttpError(400, `“${f.name}” is larger than 15 MB.`);
  }
}

export async function signedUploads(purpose, files) {
  checkFiles(purpose, files);
  const folder = newFolder(purpose);
  const bucket = db().storage.from(UPLOAD_BUCKET);
  const uploads = [];
  for (const [i, f] of files.entries()) {
    const path = `${folder}/${String(i + 1).padStart(2, '0')}-${safeName(f.name)}`;
    const { data, error } = await bucket.createSignedUploadUrl(path);
    if (error) throw new HttpError(500, 'Could not prepare the upload.');
    uploads.push({ clientId: f.clientId, path, token: data.token, signedUrl: data.signedUrl });
  }
  return { folder, folderToken: signFolder(folder), uploads };
}

/**
 * Confirm every claimed file is inside the signed folder AND actually exists in storage.
 * Returns clean metadata rows.
 */
export async function confirmUploads(files, folder, token) {
  if (!files?.length) return [];
  if (!verifyFolder(folder, token)) throw new HttpError(400, 'Upload session is invalid or expired. Please re-attach your files.');
  const { data: listed, error } = await db().storage.from(UPLOAD_BUCKET).list(folder, { limit: 100 });
  if (error) throw new HttpError(500, 'Could not verify uploads.');
  const present = new Map((listed || []).map((o) => [`${folder}/${o.name}`, o]));
  return files.map((f) => {
    if (!String(f.path).startsWith(`${folder}/`) || !present.has(f.path)) {
      throw new HttpError(400, `“${f.name || 'A file'}” didn’t finish uploading. Please try again.`);
    }
    const obj = present.get(f.path);
    return {
      path: f.path,
      fileName: String(f.name || f.path.split('/').pop()).slice(0, 120),
      fileType: obj.metadata?.mimetype || f.type,
      fileSize: obj.metadata?.size ?? f.size,
      uploadDate: new Date().toISOString(),
    };
  });
}
