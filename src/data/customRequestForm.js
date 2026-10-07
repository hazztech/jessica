/**
 * Custom Order Request — form definition.
 * A request is quoted by Jessica, so no field here carries a price.
 * Step 4 reuses the category schemas from customizationSchemas.js
 * (minus prices, uploads and notes) so both systems stay in sync.
 */
import { customizationSchemas, OCCASIONS, PALETTE } from './customizationSchemas.js';
import { categories } from './categories.js';

export const ITEM_TYPES = categories.map(({ id, name }) => ({ id, name }));

export const STEPS = [
  { id: 'type', title: 'Item Type', heading: 'What would you like Jessica to create?', intro: 'Choose one or more. You can request matching pieces together.' },
  { id: 'vision', title: 'Your Vision', heading: 'Tell us about your vision', intro: 'The more you share, the closer Jessica can get to what you’re imagining.' },
  { id: 'inspiration', title: 'Upload Inspiration', heading: 'Share your inspiration', intro: 'Photos, screenshots, sketches or designs you love. Optional, but very helpful.' },
  { id: 'details', title: 'Custom Details', heading: 'The details', intro: 'Answer what you know — anything you skip, Jessica will ask about.' },
  { id: 'budget', title: 'Budget & Timeline', heading: 'Budget & timeline', intro: 'This helps Jessica suggest the best options for you.' },
  { id: 'contact', title: 'Contact Info', heading: 'How can Jessica reach you?', intro: 'We’ll only use this to discuss your request.' },
];

export const visionFields = [
  { id: 'occasion', type: 'select', label: 'Occasion / event', placeholder: 'Choose an occasion', options: OCCASIONS },
  { id: 'styleTheme', type: 'choice', label: 'Style',
    options: [
      { value: 'glam', label: 'Glam & sparkly' },
      { value: 'elegant', label: 'Elegant' },
      { value: 'playful', label: 'Cute & playful' },
      { value: 'sporty', label: 'Sporty' },
      { value: 'classic', label: 'Classic' },
      { value: 'themed', label: 'Character / themed' },
      { value: 'unsure', label: 'Not sure yet' },
    ] },
  { id: 'colors', type: 'multiswatch', label: 'Color palette', help: 'Pick as many as you like.', options: PALETTE },
  { id: 'colorNotes', type: 'text', label: 'Color details', placeholder: 'e.g. mint with silver accents, team colors', maxLength: 100 },
  { id: 'description', type: 'textarea', label: 'Description of your vision', required: true, minLength: 20, maxLength: 2000, rows: 6,
    requiredMessage: 'Please describe what you’d like Jessica to create.',
    placeholder: 'Tell us what you’re imagining. Share colors, materials, patterns, names, dates, themes, characters, designs or anything else that will help Jessica understand your vision.' },
];

export const inspirationField = {
  id: 'inspiration', type: 'upload', label: 'Inspiration images',
  help: 'Have an idea? Upload a photo, screenshot or design reference and Jessica will use it to help understand your vision.',
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'], maxFiles: 10, maxSizeMB: 15,
};

export const commonDetailFields = [
  { id: 'names', type: 'text', label: 'Names / initials', placeholder: 'e.g. Ava, AJM, Team Hazz', maxLength: 80 },
  { id: 'designElements', type: 'multichoice', label: 'Design elements',
    options: ['Bows', 'Hearts', 'Rhinestones', 'Glitter', 'Pearls', 'Photos', 'Logos', 'Characters']
      .map((l) => ({ value: l.toLowerCase(), label: l })) },
  { id: 'quantity', type: 'number', label: 'Quantity', required: true, default: '1', maxLength: 3,
    pattern: '^[1-9][0-9]{0,2}$', patternMessage: 'Enter a quantity from 1 to 999.',
    help: 'Ordering matching pieces for a group or event? Tell us the total here.' },
  { id: 'additionalRequests', type: 'textarea', label: 'Additional requests', maxLength: 1000, rows: 3,
    placeholder: 'Placement, packaging, deadlines, anything else…' },
];

export const BUDGETS = [
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50–$100' },
  { value: '100-200', label: '$100–$200' },
  { value: '200-350', label: '$200–$350' },
  { value: '350-plus', label: '$350+' },
  { value: 'not-sure', label: 'Not sure' },
];

export const budgetFields = [
  { id: 'budget', type: 'choice', label: 'Budget', required: true, options: BUDGETS },
  { id: 'requestedDate', type: 'date', label: 'Requested completion date', min: 'today',
    help: 'Requested dates are not guaranteed until Jessica reviews and confirms the order.' },
  { id: 'rushRequested', type: 'toggle', label: 'Rush request',
    help: 'Need it sooner than usual? Rush availability and any rush fee are confirmed by Jessica.' },
];

export const CONTACT_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text' },
  { value: 'phone', label: 'Phone' },
];

export const contactFields = [
  { id: 'firstName', type: 'text', label: 'First name', required: true, maxLength: 50, autoComplete: 'given-name', hideCount: true, enterKeyHint: 'next' },
  { id: 'lastName', type: 'text', label: 'Last name', required: true, maxLength: 50, autoComplete: 'family-name', hideCount: true, enterKeyHint: 'next' },
  { id: 'email', type: 'text', label: 'Email', required: true, maxLength: 120, autoComplete: 'email', inputType: 'email', format: 'email', enterKeyHint: 'next' },
  { id: 'phone', type: 'text', label: 'Phone', maxLength: 20, autoComplete: 'tel', inputType: 'tel', format: 'phone',
    requiredWhen: { field: 'preferredContactMethod', in: ['text', 'phone'] },
    requiredMessage: 'Please add a phone number so Jessica can text or call you.' },
  { id: 'preferredContactMethod', type: 'choice', label: 'Preferred contact method', required: true, default: 'email', options: CONTACT_METHODS },
  { id: 'agree', type: 'checkbox', required: true,
    label: 'I understand this is a custom request and the final price must be approved before production begins.' },
];

/* Fields excluded from step 4 — they're covered by steps 2, 3 and 5 */
const SKIP = new Set(['inspiration', 'notes', 'rush', 'logo', 'photo', 'artwork', 'name', 'initials', 'text', 'theme']);
const SKIP_TYPES = new Set(['upload']);

const stripPrice = (o) => {
  const { price, ...rest } = o;
  return rest;
};

/**
 * Category-specific questions for a request, derived from the product schema:
 * no prices, nothing required, "None"-style defaults kept so answers stay tidy.
 */
export function requestDetailFields(category) {
  return (customizationSchemas[category] || [])
    .filter((f) => !SKIP.has(f.id) && !SKIP_TYPES.has(f.type))
    .map((f) => {
      const { price, priceLabel, required, showWhen, ...field } = f;
      if (field.options) field.options = field.options.map(stripPrice);
      if (field.optionsBy) {
        field.optionsBy = {
          ...field.optionsBy,
          map: Object.fromEntries(Object.entries(field.optionsBy.map).map(([k, v]) => [k, v.map(stripPrice)])),
        };
      }
      // keep defaults only where they mean "nothing extra" or the audience switch
      if (field.default !== undefined && field.default !== 'none' && field.id !== 'audience') delete field.default;
      return field;
    });
}

export const allStaticFields = [...visionFields, inspirationField, ...commonDetailFields, ...budgetFields, ...contactFields];
