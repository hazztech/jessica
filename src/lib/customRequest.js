/**
 * Turns raw wizard answers into a validated, sanitized custom-request record.
 * Used by the browser (preview mode) AND the Netlify function (production),
 * so the server never trusts pre-built data from the browser.
 */
import {
  ITEM_TYPES, BUDGETS, budgetFields, commonDetailFields, contactFields, requestDetailFields, visionFields,
} from '../data/customRequestForm.js';
import { cleanSelections, summarize, validate } from './customization.js';

export function buildRequestRecord({ itemTypes = [], answers = {}, details = {} }) {
  const errors = {};
  const types = [...new Set(itemTypes)].filter((t) => ITEM_TYPES.some((x) => x.id === t));
  if (!types.length) errors.itemTypes = 'Choose at least one item type.';

  for (const fields of [visionFields, commonDetailFields, budgetFields, contactFields]) {
    Object.assign(errors, validate(fields, answers));
  }
  for (const cat of types) {
    const e = validate(requestDetailFields(cat), details[cat] || {});
    for (const k of Object.keys(e)) errors[`${cat}.${k}`] = e[k];
  }
  if (Object.keys(errors).length) return { errors };

  const vision = cleanSelections(visionFields, answers);
  const common = cleanSelections(commonDetailFields, answers);
  const budget = cleanSelections(budgetFields, answers);
  const contact = cleanSelections(contactFields, answers);
  const cleanDetails = Object.fromEntries(types.map((c) => [c, cleanSelections(requestDetailFields(c), details[c] || {})]));
  const detailSummary = types.map((c) => ({ category: c, items: summarize(requestDetailFields(c), cleanDetails[c]) }));

  return {
    errors: null,
    record: {
      itemTypes: types,
      occasion: vision.occasion || null,
      styleTheme: vision.styleTheme || null,
      colors: vision.colors || [],
      colorNotes: vision.colorNotes || '',
      description: vision.description,
      personalization: common.names || '',
      designElements: common.designElements || [],
      quantity: Number(common.quantity || 1),
      additionalRequests: common.additionalRequests || '',
      sizes: detailSummary.flatMap((d) =>
        d.items.filter((r) => /size/i.test(r.fieldId)).map((r) => ({ category: d.category, label: r.label, value: r.value }))),
      details: cleanDetails,
      detailSummary,
      visionSummary: summarize(visionFields, vision),
      commonSummary: summarize(commonDetailFields, common),
      budget: budget.budget,
      budgetLabel: BUDGETS.find((b) => b.value === budget.budget)?.label || null,
      requestedDate: budget.requestedDate || null,
      rushRequested: !!budget.rushRequested,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email.toLowerCase(),
      phone: contact.phone || '',
      preferredContactMethod: contact.preferredContactMethod,
      acknowledgedPricingTerms: !!contact.agree,
    },
  };
}
