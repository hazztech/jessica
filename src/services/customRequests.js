/**
 * Custom Request service.
 *
 * FRONT-END PHASE: requests are stored in this browser's localStorage so the
 * whole flow (submit → admin dashboard) can be tested without a backend.
 *
 * PRODUCTION: replace the bodies of these functions with calls to a Netlify
 * Function (e.g. /.netlify/functions/custom-requests) that
 *   1. validates and sanitizes every field again on the server,
 *   2. uploads files to cloud storage and stores { url, fileName, fileType, fileSize, uploadDate },
 *   3. generates the request number server-side (guaranteed unique),
 *   4. inserts into the customRequests + customRequestImages tables,
 *   5. emails Jessica and the customer.
 * The function signatures below stay the same, so no UI changes are needed.
 */
import { getFile } from '../lib/uploadStore.js';

const KEY = 'jcsa-custom-requests-v1';

export const REQUEST_STATUSES = [
  { id: 'new', label: 'New Request' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'need-info', label: 'Need More Information' },
  { id: 'quote-sent', label: 'Quote Sent' },
  { id: 'awaiting-approval', label: 'Awaiting Customer Approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'deposit-paid', label: 'Deposit Paid' },
  { id: 'in-production', label: 'In Production' },
  { id: 'finishing', label: 'Finishing Touches' },
  { id: 'ready', label: 'Ready' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];
export const statusLabel = (id) => REQUEST_STATUSES.find((s) => s.id === id)?.label || id;
export const CLOSED_STATUSES = ['completed', 'cancelled'];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** JCSA-XXXXX — five digits, unique among existing requests */
export function makeRequestNumber(existing = readAll()) {
  const taken = new Set(existing.map((r) => r.requestId));
  let id;
  do {
    id = `JCSA-${Math.floor(10000 + Math.random() * 90000)}`;
  } while (taken.has(id));
  return id;
}

/** Small preview so the demo dashboard can show images after a reload */
async function thumbnail(file, size = 360) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, size / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  } catch {
    return null;
  }
}

/**
 * Submit a request. `payload` is the cleaned wizard output (see CustomOrderPage).
 * Returns the saved request including its requestId.
 */
export async function submitCustomRequest(payload) {
  const now = new Date().toISOString();
  const images = await Promise.all(
    (payload.inspiration || []).map(async (meta) => {
      const file = getFile(meta.id);
      return {
        id: meta.id,
        url: null, // set by cloud storage in production
        fileName: meta.name,
        fileType: meta.type,
        fileSize: meta.size,
        uploadDate: now,
        thumbUrl: file ? await thumbnail(file) : null,
      };
    })
  );

  const all = readAll();
  const { inspiration, agree, ...rest } = payload;
  const request = {
    ...rest,
    requestId: makeRequestNumber(all),
    customerId: null,
    customerName: `${payload.firstName} ${payload.lastName}`.trim(),
    uploadedImages: images,
    acknowledgedPricingTerms: !!agree,
    adminNotes: '',
    quotedPrice: null,
    depositAmount: null,
    status: 'new',
    statusHistory: [{ status: 'new', at: now }],
    createdAt: now,
    updatedAt: now,
  };

  await delay(500); // simulate network
  try {
    writeAll([request, ...all]);
  } catch {
    // storage full — keep the request, drop demo thumbnails
    writeAll([{ ...request, uploadedImages: images.map((i) => ({ ...i, thumbUrl: null })) }, ...all]);
  }
  return request;
}

export async function listCustomRequests({ status } = {}) {
  const all = readAll();
  if (!status || status === 'all') return all;
  if (status === 'open') return all.filter((r) => r.status !== 'new' && !CLOSED_STATUSES.includes(r.status));
  if (status === 'closed') return all.filter((r) => CLOSED_STATUSES.includes(r.status));
  return all.filter((r) => r.status === status);
}

export async function getCustomRequest(requestId) {
  return readAll().find((r) => r.requestId === requestId) || null;
}

/** Admin updates: status, adminNotes, quotedPrice, depositAmount */
export async function updateCustomRequest(requestId, patch) {
  const all = readAll();
  const now = new Date().toISOString();
  let updated = null;
  const next = all.map((r) => {
    if (r.requestId !== requestId) return r;
    const statusChanged = patch.status && patch.status !== r.status;
    updated = {
      ...r,
      ...patch,
      statusHistory: statusChanged ? [...r.statusHistory, { status: patch.status, at: now }] : r.statusHistory,
      updatedAt: now,
    };
    return updated;
  });
  writeAll(next);
  return updated;
}

export async function countNewRequests() {
  return readAll().filter((r) => r.status === 'new').length;
}

/** Fired after admin changes so counts/badges refresh */
export const REQUESTS_CHANGED = 'jcsa:requests-changed';
