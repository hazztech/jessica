/**
 * In-memory home for customer files until checkout.
 *
 * Files are NEVER written to localStorage or the database. The cart keeps only
 * metadata ({ id, name, size, type }). At checkout, files are sent to cloud storage
 * and the order stores the returned URL, file name, type, size and upload date.
 *
 * If the page is reloaded the File objects are gone — the cart flags those lines
 * so the customer can re-attach them from "Edit".
 */
const files = new Map(); // id -> { file, url }

const makeId = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function addFile(file) {
  const id = makeId();
  const type = fileType(file);
  const url = type.startsWith('image/') ? URL.createObjectURL(file) : null;
  files.set(id, { file, url });
  return { id, name: file.name, size: file.size, type, previewUrl: url };
}

export function removeFile(id) {
  const entry = files.get(id);
  if (entry?.url) URL.revokeObjectURL(entry.url);
  files.delete(id);
}

export const getFile = (id) => files.get(id)?.file || null;
export const getPreview = (id) => files.get(id)?.url || null;
export const hasFile = (id) => files.has(id);

const EXT_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif', pdf: 'application/pdf' };
/** Some phones report an empty type (often HEIC) — fall back to the extension. */
export const fileType = (file) => file.type || EXT_TYPES[file.name.split('.').pop().toLowerCase()] || '';

/** Validate a picked file against a field's rules. Returns an error string or null. */
export function checkFile(file, { accept = [], maxSizeMB = 10 }) {
  const type = fileType(file);
  if (accept.length && !accept.includes(type)) {
    const names = [...new Set(accept.map((t) => (t === 'application/pdf' ? 'PDF' : t.split('/')[1].toUpperCase().replace('JPEG', 'JPG').replace('HEIF', 'HEIC'))))].join(', ');
    return `“${file.name}” isn’t a supported file. Use ${names}.`;
  }
  if (file.size > maxSizeMB * 1024 * 1024) return `“${file.name}” is larger than ${maxSizeMB} MB.`;
  return null;
}
