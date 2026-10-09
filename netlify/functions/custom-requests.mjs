/**
 * POST /api/custom-requests
 * Body: { itemTypes, answers, details, files: { folder, token, items: [{ path, name, type, size }] }, website }
 * Everything is re-validated and rebuilt on the server from the raw answers.
 */
import { handler, json, readJson } from './_lib/http.js';
import { db, HttpError, must } from './_lib/supabase.js';
import { confirmUploads, LIMITS } from './_lib/uploads.js';
import { sendEmail, templates } from './_lib/email.js';
import { buildRequestRecord } from '../../src/lib/customRequest.js';
import { requestToRow } from '../../src/lib/mappers.js';

const requestNumber = () => `JCSA-${Math.floor(10000 + Math.random() * 90000)}`;

export default handler(['POST'], async (req) => {
  const body = await readJson(req, 128 * 1024);
  if (body.website) throw new HttpError(400, 'Request rejected.'); // honeypot field — humans never fill it

  const { record, errors } = buildRequestRecord({ itemTypes: body.itemTypes, answers: body.answers, details: body.details });
  if (errors) throw new HttpError(422, 'Please check the highlighted fields.', errors);

  const fileItems = body.files?.items || [];
  if (fileItems.length > LIMITS.request) throw new HttpError(400, `You can upload up to ${LIMITS.request} images.`);
  const images = await confirmUploads(fileItems, body.files?.folder, body.files?.token);

  // request numbers are random 5-digit codes — retry on the rare collision
  let row;
  for (let attempt = 0; attempt < 6 && !row; attempt++) {
    const { data, error } = await db().from('custom_requests')
      .insert({ ...requestToRow(record), request_number: requestNumber() })
      .select('id, request_number').single();
    if (!error) row = data;
    else if (error.code !== '23505') must({ error }, 'Could not save your request');
  }
  if (!row) throw new HttpError(500, 'Could not save your request. Please try again.');

  if (images.length) {
    must(await db().from('custom_request_images').insert(images.map((i) => ({
      request_id: row.id, path: i.path, file_name: i.fileName, file_type: i.fileType, file_size: i.fileSize, uploaded_at: i.uploadDate,
    }))), 'Could not save your images');
  }

  const summary = { ...record, requestNumber: row.request_number };
  await Promise.all([
    sendEmail({ to: record.email, ...templates.requestToCustomer(summary) }),
    sendEmail({ to: process.env.NOTIFY_EMAIL, replyTo: record.email, ...templates.requestToJessica(summary) }),
  ]);

  return json(201, {
    requestNumber: row.request_number,
    firstName: record.firstName,
    itemTypes: record.itemTypes,
    preferredContactMethod: record.preferredContactMethod,
    email: record.email,
    phone: record.phone,
  });
});
