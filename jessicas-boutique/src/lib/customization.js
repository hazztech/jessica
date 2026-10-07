import { customizationSchemas, GROUPS } from '../data/customizationSchemas.js';
import { effectivePrice } from './format.js';
import { sanitizeText } from './sanitize.js';

/* ============================================================
 *  Schema resolution — category schema + per-product admin settings
 *
 *  product.customization = {
 *    disabledFields: ['dressSize'],                 // hide these fields
 *    fieldOverrides: { name: { maxLength: 12, label: 'Name on heel' } },
 *    priceOverrides: { name: 12, 'rhinestones.full': 50 },  // field or field.option
 *    disabledOptions: { shoeStyle: ['boots'] },     // hide individual options
 *    extraOptions: [                                 // admin-created, this product only
 *      { id: 'x1', kind: 'addon', label: 'Gift box', price: 6 },
 *      { id: 'x2', kind: 'choice', label: 'Lace style', options: [{ value: 'flat', label: 'Flat', price: 0 }, …] },
 *    ],
 *  }
 * ============================================================ */
export function resolveSchema(product) {
  if (!product?.customizable) return [];
  const base = customizationSchemas[product.category] || [];
  const cfg = product.customization || {};
  const disabled = new Set(cfg.disabledFields || []);
  const prices = cfg.priceOverrides || {};

  const applyOptions = (fieldId, options) =>
    options
      .filter((o) => !(cfg.disabledOptions?.[fieldId] || []).includes(o.value))
      .map((o) => (prices[`${fieldId}.${o.value}`] != null ? { ...o, price: prices[`${fieldId}.${o.value}`] } : o));

  const extras = (cfg.extraOptions || []).filter((x) => x.label?.trim()).map((x) => {
    if (x.kind === 'choice') {
      const opts = (x.options || []).filter((o) => o.label?.trim())
        .map((o, i) => ({ value: o.value || `o${i}`, label: o.label.trim(), price: Number(o.price) || 0 }));
      return { id: `extra-${x.id}`, type: 'choice', label: x.label.trim(), group: 'style',
        required: !!x.required, default: x.required ? undefined : 'none',
        options: x.required ? opts : [{ value: 'none', label: 'None' }, ...opts] };
    }
    return { id: `extra-${x.id}`, type: 'toggle', label: x.label.trim(), group: 'extras',
      price: Number(x.price) || 0, priceLabel: x.label.trim(), help: x.help || undefined };
  });

  return [...base, ...extras]
    .filter((f) => !disabled.has(f.id))
    .map((f) => {
      const field = { ...f, ...(cfg.fieldOverrides?.[f.id] || {}) };
      if (prices[f.id] != null) field.price = prices[f.id];
      if (field.options) field.options = applyOptions(f.id, field.options);
      if (field.optionsBy) {
        field.optionsBy = {
          ...field.optionsBy,
          map: Object.fromEntries(
            Object.entries(field.optionsBy.map).map(([k, opts]) => [k, applyOptions(f.id, opts)])
          ),
        };
      }
      return field;
    });
}

/** Fields grouped into sections, skipping empty sections */
export function groupFields(fields) {
  return GROUPS.map((g) => ({ ...g, fields: fields.filter((f) => f.group === g.id) })).filter((g) => g.fields.length);
}

/* ---------------- Values ---------------- */

export function getOptions(field, values) {
  if (field.optionsBy) return field.optionsBy.map[values[field.optionsBy.field]] || [];
  return field.options || [];
}

export function isVisible(field, values) {
  const rule = field.showWhen;
  if (!rule) return true;
  const v = values[rule.field];
  if (rule.in) return rule.in.includes(v);
  if (rule.filled) return isFilled(v);
  return true;
}

export function isFilled(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'boolean') return v;
  return v != null && String(v).trim() !== '';
}

export function defaultValues(fields) {
  const values = {};
  for (const f of fields) {
    if (f.default !== undefined) values[f.id] = f.default;
    else if (f.type === 'upload') values[f.id] = [];
    else if (f.type === 'toggle' || f.type === 'checkbox') values[f.id] = false;
    else if (f.type === 'multichoice' || f.type === 'multiswatch') values[f.id] = [];
    else values[f.id] = '';
  }
  return values;
}

/**
 * Apply a change and clear answers that are no longer valid
 * (e.g. switching Adult → Youth clears an adult-only size).
 */
export function applyChange(fields, values, id, value) {
  const next = { ...values, [id]: value };
  for (const f of fields) {
    const v = next[f.id];
    if (f.optionsBy && v && !getOptions(f, next).some((o) => o.value === v)) next[f.id] = '';
  }
  return next;
}

/* ---------------- Validation ---------------- */

/** Required either always, or when another answer matches (requiredWhen) */
export function isRequired(field, values) {
  if (field.required) return true;
  const rule = field.requiredWhen;
  return !!rule && rule.in.includes(values[rule.field]);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function validate(fields, values) {
  const errors = {};
  for (const f of fields) {
    if (!isVisible(f, values)) continue;
    const v = values[f.id];
    if (isRequired(f, values) && !isFilled(v)) {
      errors[f.id] = requiredMessage(f);
      continue;
    }
    if (!isFilled(v)) continue;
    const str = typeof v === 'string' ? v.trim() : v;
    if (f.minLength && typeof str === 'string' && str.length < f.minLength) {
      errors[f.id] = `Please add a little more detail (at least ${f.minLength} characters).`;
    } else if (f.maxLength && typeof v === 'string' && v.length > f.maxLength) {
      errors[f.id] = `Keep this to ${f.maxLength} characters or fewer.`;
    } else if (f.format === 'email' && !EMAIL.test(str)) {
      errors[f.id] = 'Enter an email address like name@example.com.';
    } else if (f.format === 'phone' && !/^\d{10,15}$/.test(String(str).replace(/\D/g, ''))) {
      errors[f.id] = 'Enter a phone number with area code.';
    } else if (f.pattern && typeof v === 'string' && !new RegExp(f.pattern).test(v)) {
      errors[f.id] = f.patternMessage || (f.type === 'number' ? `Enter up to ${f.maxLength} digits.` : 'Please check this entry.');
    } else if (f.type === 'date' && Number.isNaN(Date.parse(v))) {
      errors[f.id] = 'Enter a valid date.';
    } else if (f.type === 'date' && f.min === 'today' && v < todayISO()) {
      errors[f.id] = 'Choose a date in the future.';
    }
  }
  return errors;
}

function requiredMessage(f) {
  if (f.requiredMessage) return f.requiredMessage;
  if (f.type === 'upload') return `Please upload your ${f.label.toLowerCase()}.`;
  if (f.type === 'checkbox') return 'Please check this box to continue.';
  if (['text', 'textarea', 'number', 'date'].includes(f.type)) return `Please enter your ${f.label.toLowerCase()}.`;
  return `Please choose ${article(f.label)}.`;
}
const article = (label) => `a ${label.toLowerCase()}`;

/* ---------------- Pricing ---------------- */

/** Every paid selection as { fieldId, label, amount } — drives the live price summary */
export function priceLines(fields, values) {
  const lines = [];
  for (const f of fields) {
    if (!isVisible(f, values)) continue;
    const v = values[f.id];
    if (['choice', 'swatch', 'select'].includes(f.type)) {
      const opt = getOptions(f, values).find((o) => o.value === v);
      if (opt?.price) lines.push({ fieldId: f.id, label: `${f.label}: ${opt.label}`, amount: opt.price });
    } else if (f.price && isFilled(v)) {
      const count = Array.isArray(v) ? v.length : 1;
      const amount = f.pricePerFile ? f.pricePerFile * count : f.price;
      lines.push({ fieldId: f.id, label: f.priceLabel || f.label, amount });
    }
  }
  return lines;
}

export function computePrice(product, fields, values, quantity = 1) {
  const base = effectivePrice(product);
  const lines = priceLines(fields, values);
  const addOns = lines.reduce((s, l) => s + l.amount, 0);
  const unit = base + addOns;
  return { base, lines, addOns, unit, quantity, total: unit * quantity };
}

/** Starting price label for cards: "$145" */
export const startingPrice = (product) => effectivePrice(product);

/* ---------------- Cart line ---------------- */

/** "2026-11-20" → "November 20, 2026" (treated as a local date, no timezone shift) */
export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Human-readable selections for the cart, order emails and admin */
export function summarize(fields, values) {
  const out = [];
  for (const f of fields) {
    if (!isVisible(f, values)) continue;
    const v = values[f.id];
    if (!isFilled(v)) continue;
    if (f.type === 'toggle' || f.type === 'checkbox') { out.push({ fieldId: f.id, label: f.label, value: 'Yes' }); continue; }
    if (f.type === 'multichoice' || f.type === 'multiswatch') {
      const opts = getOptions(f, values).filter((o) => v.includes(o.value));
      out.push({
        fieldId: f.id, label: f.label, value: opts.map((o) => o.label).join(', '),
        ...(f.type === 'multiswatch' ? { hexes: opts.map((o) => o.hex) } : {}),
      });
      continue;
    }
    if (f.type === 'upload') {
      out.push({ fieldId: f.id, label: f.label, value: `${v.length} file${v.length > 1 ? 's' : ''}`, files: v.length });
      continue;
    }
    if (['choice', 'swatch', 'select'].includes(f.type)) {
      const opt = getOptions(f, values).find((o) => o.value === v);
      // skip "None" defaults — they add noise in the cart
      if (!opt || opt.value === 'none') continue;
      out.push({ fieldId: f.id, label: f.label, value: opt.label, hex: opt.hex });
      continue;
    }
    if (f.type === 'date') { out.push({ fieldId: f.id, label: f.label, value: formatDate(v) }); continue; }
    out.push({ fieldId: f.id, label: f.label, value: String(v) });
  }
  return out;
}

/** Strip hidden fields, sanitize text, keep only upload metadata (never file contents) */
export function cleanSelections(fields, values) {
  const out = {};
  for (const f of fields) {
    if (!isVisible(f, values)) continue;
    let v = values[f.id];
    if (!isFilled(v)) continue;
    if (f.type === 'upload') v = v.map(({ id, name, size, type }) => ({ id, name, size, type }));
    else if (Array.isArray(v)) v = v.filter((x) => getOptions(f, values).some((o) => o.value === x));
    else if (typeof v === 'string') {
      v = sanitizeText(v, f.maxLength);
      if (f.transform === 'upper') v = v.toUpperCase();
    }
    out[f.id] = v;
  }
  return out;
}

/** Stable fingerprint — identical configurations merge, different ones stay separate */
export function signature(productId, selections) {
  const keys = Object.keys(selections).sort();
  const norm = keys.map((k) => {
    const v = selections[k];
    return [k, Array.isArray(v) ? v.map((f) => f.id) : v];
  });
  return `${productId}::${JSON.stringify(norm)}`;
}

export function buildCartLine(product, fields, values, quantity) {
  const selections = cleanSelections(fields, values);
  const price = computePrice(product, fields, selections, quantity);
  const uploads = Object.values(selections).filter(Array.isArray).flat();
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    image: product.images?.[0] || null,
    basePrice: price.base,
    selections,                       // raw values — used to re-open the editor
    // readable selections, each carrying its own add-on price (if any)
    summary: summarize(fields, selections).map((row) => {
      const charge = price.lines.find((l) => l.fieldId === row.fieldId);
      return charge ? { ...row, price: charge.amount } : row;
    }),
    charges: price.lines.map(({ fieldId, label, amount }) => ({ fieldId, label, amount })), // for orders/admin
    unitPrice: price.unit,
    uploadCount: uploads.length,
    signature: signature(product.id, selections),
    quantity,
  };
}

/** Quick-add is only possible when every required answer has a default */
export function canQuickAdd(product) {
  const fields = resolveSchema(product);
  return fields.every((f) => !f.required || f.default !== undefined);
}
