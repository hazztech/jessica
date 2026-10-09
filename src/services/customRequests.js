/**
 * Custom Request service.
 *   Preview: requests are stored in this browser so the flow can be tested offline.
 *   Live:    files upload to the private `customer-uploads` bucket via signed URLs,
 *            then /api/custom-requests validates and saves everything server-side.
 *            Admins read/update through Supabase (Row Level Security: admins only).
 */
import { getFile } from '../lib/uploadStore.js';
import { BACKEND, api, check, stash, supabase } from '../lib/backend.js';
import { buildRequestRecord } from '../lib/customRequest.js';
import { requestFromRow } from '../lib/mappers.js';
import { uploadCustomerFiles } from './uploads.js';

const KEY = 'jcsa-custom-requests-v1';
const SELECT = '*, custom_request_images(*), custom_request_status_history(*)';

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
/** Fired after admin changes so counts/badges refresh */
export const REQUESTS_CHANGED = 'jcsa:requests-changed';

/* ---------- preview storage ---------- */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeAll(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

export function makeRequestNumber(existing = readAll()) {
  const taken = new Set(existing.map((r) => r.requestId));
  let id;
  do { id = `JCSA-${Math.floor(10000 + Math.random() * 90000)}`; } while (taken.has(id));
  return id;
}

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
 * Submit raw wizard answers: { itemTypes, answers, details }.
 * Returns { requestId, firstName, itemTypes, preferredContactMethod, email, phone }.
 */
export async function submitCustomRequest({ itemTypes, answers, details, website = '' }) {
  const inspiration = answers.inspiration || [];

  if (BACKEND) {
    const files = await uploadCustomerFiles('request', inspiration);
    const res = await api('custom-requests', {
      itemTypes, details, website,
      answers: { ...answers, inspiration: undefined },
      files: files ? { folder: files.folder, token: files.token, items: files.items } : null,
    });
    const summary = { ...res, requestId: res.requestNumber };
    stash.set('last-request', summary);
    return summary;
  }

  const { record, errors } = buildRequestRecord({ itemTypes, answers, details });
  if (errors) {
    const err = new Error('Please check the highlighted fields.');
    err.details = errors;
    throw err;
  }
  const now = new Date().toISOString();
  const images = await Promise.all(inspiration.map(async (meta) => {
    const file = getFile(meta.id);
    return {
      id: meta.id, url: null, fileName: meta.name, fileType: meta.type, fileSize: meta.size,
      uploadDate: now, thumbUrl: file ? await thumbnail(file) : null,
    };
  }));
  const all = readAll();
  const request = {
    ...record,
    requestId: makeRequestNumber(all),
    customerId: null,
    customerName: `${record.firstName} ${record.lastName}`.trim(),
    uploadedImages: images,
    adminNotes: '', quotedPrice: null, depositAmount: null,
    status: 'new', statusHistory: [{ status: 'new', at: now }],
    createdAt: now, updatedAt: now,
  };
  await delay(500);
  try {
    writeAll([request, ...all]);
  } catch {
    writeAll([{ ...request, uploadedImages: images.map((i) => ({ ...i, thumbUrl: null })) }, ...all]);
  }
  return request;
}

export async function listCustomRequests({ status } = {}) {
  let all;
  if (BACKEND) {
    const sb = await supabase();
    all = check(await sb.from('custom_requests').select(SELECT).order('created_at', { ascending: false }), 'Could not load requests').map(requestFromRow);
  } else {
    all = readAll();
  }
  if (!status || status === 'all') return all;
  if (status === 'open') return all.filter((r) => r.status !== 'new' && !CLOSED_STATUSES.includes(r.status));
  if (status === 'closed') return all.filter((r) => CLOSED_STATUSES.includes(r.status));
  return all.filter((r) => r.status === status);
}

/** Admin detail. Live mode attaches short-lived signed URLs for the private images. */
export async function getCustomRequest(requestId) {
  if (!BACKEND) return readAll().find((r) => r.requestId === requestId) || null;
  const sb = await supabase();
  const row = check(await sb.from('custom_requests').select(SELECT).eq('request_number', requestId).maybeSingle(), 'Could not load the request');
  if (!row) return null;
  const req = requestFromRow(row);
  const paths = req.uploadedImages.map((i) => i.path);
  if (paths.length) {
    const { data } = await sb.storage.from('customer-uploads').createSignedUrls(paths, 3600);
    const byPath = new Map((data || []).map((d) => [d.path, d.signedUrl]));
    req.uploadedImages = req.uploadedImages.map((i) => ({ ...i, url: byPath.get(i.path) || null }));
  }
  return req;
}

/** The success page reads this (shoppers can't read requests from the database). */
export async function getSubmittedRequest(requestId) {
  const last = stash.get('last-request');
  if (last?.requestId === requestId) return last;
  return BACKEND ? null : getCustomRequest(requestId);
}

/** Admin updates: status, adminNotes, quotedPrice, depositAmount */
export async function updateCustomRequest(requestId, patch) {
  if (BACKEND) {
    const sb = await supabase();
    const row = {};
    if (patch.status) row.status = patch.status;
    if ('adminNotes' in patch) row.admin_notes = patch.adminNotes;
    if ('quotedPrice' in patch) row.quoted_price = patch.quotedPrice;
    if ('depositAmount' in patch) row.deposit_amount = patch.depositAmount;
    check(await sb.from('custom_requests').update(row).eq('request_number', requestId), 'Could not update the request');
    return getCustomRequest(requestId);
  }
  const all = readAll();
  const now = new Date().toISOString();
  let updated = null;
  const next = all.map((r) => {
    if (r.requestId !== requestId) return r;
    const statusChanged = patch.status && patch.status !== r.status;
    updated = {
      ...r, ...patch,
      statusHistory: statusChanged ? [...r.statusHistory, { status: patch.status, at: now }] : r.statusHistory,
      updatedAt: now,
    };
    return updated;
  });
  writeAll(next);
  return updated;
}

export async function countNewRequests() {
  if (BACKEND) {
    const sb = await supabase();
    const { count } = await sb.from('custom_requests').select('id', { count: 'exact', head: true }).eq('status', 'new');
    return count || 0;
  }
  return readAll().filter((r) => r.status === 'new').length;
}
