/**
 * POST /api/upload-urls
 * { purpose: 'request' | 'order', files: [{ clientId, name, type, size }] }
 * → { folder, folderToken, uploads: [{ clientId, path, token, signedUrl }] }
 * The browser then uploads each file directly to Supabase Storage.
 */
import { handler, json, readJson } from './_lib/http.js';
import { signedUploads } from './_lib/uploads.js';

export default handler(['POST'], async (req) => {
  const { purpose, files } = await readJson(req, 16 * 1024);
  return json(200, await signedUploads(purpose, files));
});
