/**
 * ============================================================
 *  CUSTOMIZATION SCHEMAS — one per category, built from a shared
 *  field library. The product page renders whatever the schema
 *  says; there are no per-category pages.
 * ============================================================
 *
 * Field shape
 * {
 *   id:        unique key, stored in the cart line and order
 *   type:      'choice' | 'swatch' | 'select' | 'text' | 'number' | 'date'
 *              | 'textarea' | 'upload' | 'toggle'
 *   label, help, placeholder
 *   group:     'fit' | 'style' | 'personalize' | 'embellish' | 'inspire' | 'extras'
 *   required:  boolean
 *   default:   initial value
 *   options:   [{ value, label, price?, hex?, group? }]  (choice/swatch/select)
 *   optionsBy: { field, map: { [fieldValue]: options[] } } — options that depend
 *              on another answer (e.g. sizes for adult vs youth)
 *   price:     flat charge when a text/date/toggle/upload field is filled
 *   priceLabel: wording used in the price summary
 *   maxLength, pattern, accept, maxFiles, maxSizeMB
 *   showWhen:  { field, in: [...] } | { field, filled: true }
 * }
 *
 * Admin later: products.customization can disable fields, override
 * labels/limits and override any price (see lib/customization.js).
 * Prices below are SAMPLE defaults.
 */

/* ---------------- Shared option lists ---------------- */

export const PALETTE = [
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'black', label: 'Black', hex: '#1F1F1F' },
  { value: 'silver', label: 'Silver', hex: '#C9CDD1' },
  { value: 'mint', label: 'Mint', hex: '#4FCDBB' },
  { value: 'teal', label: 'Teal', hex: '#07877C' },
  { value: 'pink', label: 'Pink', hex: '#F4A7C0' },
  { value: 'lavender', label: 'Lavender', hex: '#C9B6E4' },
  { value: 'gold', label: 'Gold', hex: '#D4AF37' },
  { value: 'red', label: 'Red', hex: '#C8102E' },
  { value: 'royal-blue', label: 'Royal blue', hex: '#2850A0' },
  { value: 'other', label: 'Other — describe in notes', hex: null },
];

const AUDIENCE = [
  { value: 'adult', label: 'Adult' },
  { value: 'youth', label: 'Youth' },
];

const range = (from, to, step = 1) => {
  const out = [];
  for (let n = from; n <= to + 1e-9; n += step) out.push(n);
  return out;
};

const SHOE_SIZES = [
  ...range(5, 11, 0.5).map((n) => ({ value: `w-${n}`, label: `Women’s ${n}`, group: 'Women' })),
  ...range(6, 14, 0.5).map((n) => ({ value: `m-${n}`, label: `Men’s ${n}`, group: 'Men' })),
  ...range(10, 13.5, 0.5).map((n) => ({ value: `c-${n}`, label: `Kids ${n}C`, group: 'Kids' })),
  ...range(1, 7, 0.5).map((n) => ({ value: `y-${n}`, label: `Youth ${n}Y`, group: 'Youth' })),
];

const ADULT_APPAREL = [
  { value: 'xs', label: 'XS' }, { value: 's', label: 'S' }, { value: 'm', label: 'M' },
  { value: 'l', label: 'L' }, { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL', price: 3 }, { value: '3xl', label: '3XL', price: 5 },
];
const YOUTH_APPAREL = [
  { value: '2t', label: '2T' }, { value: '3t', label: '3T' }, { value: '4t', label: '4T' },
  { value: 'yxs', label: 'Youth XS (4–5)' }, { value: 'ys', label: 'Youth S (6–7)' },
  { value: 'ym', label: 'Youth M (8)' }, { value: 'yl', label: 'Youth L (10–12)' },
  { value: 'yxl', label: 'Youth XL (14–16)' },
];
const apparelSizes = { field: 'audience', map: { adult: ADULT_APPAREL, youth: YOUTH_APPAREL } };

const DRESS_SIZES = {
  field: 'audience',
  map: {
    adult: range(0, 16, 2).map((n) => ({ value: `d-${n}`, label: `Size ${n}` })),
    youth: ['2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14', '16'].map((s) => ({ value: `yd-${s}`, label: s })),
  },
};

const SOCK_SIZES = {
  field: 'audience',
  map: {
    adult: [
      { value: 's', label: 'Small (women’s 5–7)' },
      { value: 'm', label: 'Medium (women’s 8–10 / men’s 6–9)' },
      { value: 'l', label: 'Large (men’s 10–13)' },
    ],
    youth: [
      { value: 'toddler', label: 'Toddler (shoe 4–9)' },
      { value: 'ks', label: 'Kids S (shoe 10–13)' },
      { value: 'km', label: 'Kids M (shoe 1–4)' },
      { value: 'kl', label: 'Kids L (shoe 5–7)' },
    ],
  },
};

export const OCCASIONS = ['Birthday', 'Wedding', 'Prom', 'Quinceañera', 'Sports', 'Graduation', 'Holiday', 'Everyday', 'Other']
  .map((o) => ({ value: o.toLowerCase(), label: o }));

/* HEIC/HEIF = iPhone photos. Previews show where the browser supports them; the server converts on upload. */
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/* ---------------- Reusable field builders ---------------- */

const audience = () => ({
  id: 'audience', type: 'choice', label: 'Adult or youth', group: 'fit',
  required: true, default: 'adult', options: AUDIENCE,
});

const sizeField = (id, label, optionsBy, extra = {}) => ({
  id, type: 'select', label, group: 'fit', required: true,
  placeholder: 'Choose a size', optionsBy, ...extra,
});

const color = (id, label, extra = {}) => ({
  id, type: 'swatch', label, group: 'style', options: PALETTE, ...extra,
});

const name = (price = 10) => ({
  id: 'name', type: 'text', label: 'Name', group: 'personalize',
  placeholder: 'e.g. Ava', maxLength: 20, price, priceLabel: 'Custom name',
});

const text = (price = 5, maxLength = 40) => ({
  id: 'text', type: 'text', label: 'Text or phrase', group: 'personalize',
  placeholder: 'e.g. Birthday Queen', maxLength, price, priceLabel: 'Custom text',
});

const initials = (price = 5) => ({
  id: 'initials', type: 'text', label: 'Initials', group: 'personalize',
  placeholder: 'e.g. AJM', maxLength: 4, price, priceLabel: 'Initials', transform: 'upper',
});

const number = (price = 5) => ({
  id: 'number', type: 'number', label: 'Number', group: 'personalize',
  placeholder: 'e.g. 23', maxLength: 3, pattern: '^[0-9]{1,3}$', price, priceLabel: 'Number',
});

const theme = () => ({
  id: 'theme', type: 'text', label: 'Theme', group: 'style',
  placeholder: 'e.g. Mermaid, team colors, under the sea', maxLength: 60,
});

const rhinestones = (id = 'rhinestones', label = 'Rhinestones') => ({
  id, type: 'choice', label, group: 'embellish', default: 'none',
  options: [
    { value: 'none', label: 'None' },
    { value: 'accents', label: 'Accents' },
    { value: 'partial', label: 'Partial coverage', price: 20 },
    { value: 'full', label: 'Full coverage', price: 45 },
  ],
});

const logoUpload = (price = 15) => ({
  id: 'logo', type: 'upload', label: 'Logo', group: 'personalize',
  help: 'Upload a clear logo file. PNG with a transparent background works best.',
  accept: [...IMAGE_TYPES, 'application/pdf'], maxFiles: 1, maxSizeMB: 10,
  price, priceLabel: 'Logo setup',
});

const inspiration = (label = 'Upload Inspiration Image') => ({
  id: 'inspiration', type: 'upload', label, group: 'inspire',
  help: 'Have an idea? Upload a photo, screenshot or design reference and Jessica will use it to help understand your vision.',
  accept: IMAGE_TYPES, maxFiles: 5, maxSizeMB: 10,
});

const notes = (label = 'Additional notes') => ({
  id: 'notes', type: 'textarea', label, group: 'inspire',
  placeholder: 'Anything else Jessica should know — placement, colors, deadlines…', maxLength: 500,
});

const rush = () => ({
  id: 'rush', type: 'toggle', label: 'Rush order', group: 'extras',
  help: 'Moves your order to the front of the queue. Final timing is confirmed by Jessica.',
  price: 25, priceLabel: 'Rush order',
});

/* ---------------- Category schemas ---------------- */

export const customizationSchemas = {
  shoes: [
    sizeField('size', 'Shoe size', null, { options: SHOE_SIZES }),
    { id: 'style', type: 'choice', label: 'Shoe style', group: 'style', required: true, default: 'low-top',
      options: [
        { value: 'low-top', label: 'Low-top sneaker' },
        { value: 'high-top', label: 'High-top sneaker', price: 10 },
        { value: 'slip-on', label: 'Slip-on' },
        { value: 'heels', label: 'Heels', price: 15 },
        { value: 'boots', label: 'Boots', price: 25 },
      ] },
    color('primaryColor', 'Primary color', { required: true }),
    color('secondaryColor', 'Secondary color'),
    rhinestones(),
    { id: 'bows', type: 'choice', label: 'Bows', group: 'embellish', default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'small', label: 'Small bows', price: 8 },
        { value: 'statement', label: 'Statement bows', price: 15 },
      ] },
    name(),
    initials(),
    { id: 'specialDate', type: 'date', label: 'Special date', group: 'personalize', price: 5, priceLabel: 'Special date' },
    inspiration(),
    notes(),
    rush(),
  ],

  outfits: [
    audience(),
    sizeField('topSize', 'Top size', apparelSizes),
    sizeField('bottomSize', 'Bottom size', apparelSizes),
    sizeField('dressSize', 'Dress size', DRESS_SIZES),
    color('primaryColor', 'Primary color', { required: true }),
    color('secondaryColor', 'Secondary color'),
    { id: 'occasion', type: 'select', label: 'Occasion', group: 'style', placeholder: 'Choose an occasion', options: OCCASIONS },
    theme(),
    name(),
    rhinestones(),
    inspiration(),
    notes(),
    rush(),
  ],

  shirts: [
    audience(),
    sizeField('shirtSize', 'Shirt size', apparelSizes),
    { id: 'shirtType', type: 'choice', label: 'Shirt type', group: 'style', required: true, default: 'crew',
      options: [
        { value: 'crew', label: 'Crew tee' },
        { value: 'v-neck', label: 'V-neck', price: 3 },
        { value: 'long-sleeve', label: 'Long sleeve', price: 6 },
        { value: 'tank', label: 'Tank' },
        { value: 'hoodie', label: 'Hoodie', price: 20 },
      ] },
    color('shirtColor', 'Shirt color', { required: true }),
    text(),
    name(),
    number(),
    { id: 'graphic', type: 'choice', label: 'Graphic', group: 'personalize', default: 'none',
      options: [
        { value: 'none', label: 'No graphic' },
        { value: 'jessica', label: 'Jessica designs it', price: 15 },
        { value: 'upload', label: 'My own artwork', price: 20 },
      ] },
    { id: 'placement', type: 'choice', label: 'Design placement', group: 'personalize', default: 'front',
      options: [
        { value: 'front', label: 'Front' },
        { value: 'back', label: 'Back' },
        { value: 'both', label: 'Front & back', price: 12 },
      ] },
    { ...inspiration('Upload artwork'), id: 'artwork', group: 'personalize', required: true,
      help: 'Upload the artwork to print. High-resolution PNG or PDF works best.',
      accept: [...IMAGE_TYPES, 'application/pdf'],
      showWhen: { field: 'graphic', in: ['upload'] } },
    notes('Notes'),
    rush(),
  ],

  ties: [
    audience(),
    { id: 'tieStyle', type: 'choice', label: 'Tie style', group: 'style', required: true, default: 'classic',
      options: [
        { value: 'classic', label: 'Classic' },
        { value: 'skinny', label: 'Skinny' },
        { value: 'bow', label: 'Bow tie' },
        { value: 'clip-on', label: 'Clip-on' },
      ] },
    color('baseColor', 'Base color', { required: true }),
    color('accentColor', 'Accent color'),
    theme(),
    initials(),
    { id: 'crystals', type: 'choice', label: 'Crystals', group: 'embellish', default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'accent', label: 'Crystal accents', price: 10 },
        { value: 'full', label: 'Full crystal', price: 25 },
      ] },
    inspiration(),
    notes('Notes'),
    rush(),
  ],

  tumblers: [
    { id: 'tumblerSize', type: 'choice', label: 'Tumbler size', group: 'fit', required: true, default: '20oz',
      options: [
        { value: '12oz', label: '12 oz kids' },
        { value: '20oz', label: '20 oz' },
        { value: '30oz', label: '30 oz', price: 6 },
        { value: '40oz', label: '40 oz', price: 12 },
      ] },
    color('baseColor', 'Base color', { required: true }),
    name(),
    text(),
    { id: 'photo', type: 'upload', label: 'Photo', group: 'personalize',
      help: 'Add a photo to be printed on your tumbler.',
      accept: IMAGE_TYPES, maxFiles: 1, maxSizeMB: 10, price: 20, priceLabel: 'Custom image' },
    logoUpload(),
    theme(),
    { id: 'glitter', type: 'choice', label: 'Glitter', group: 'embellish', default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'fine', label: 'Fine glitter' },
        { value: 'chunky', label: 'Chunky glitter', price: 8 },
        { value: 'ombre', label: 'Ombré glitter', price: 10 },
      ] },
    rhinestones(),
    inspiration(),
    notes('Notes'),
    rush(),
  ],

  socks: [
    audience(),
    sizeField('sockSize', 'Sock size', SOCK_SIZES),
    color('baseColor', 'Base color', { required: true }),
    color('accentColor', 'Accent color'),
    name(8),
    number(4),
    logoUpload(),
    theme(),
    notes('Notes'),
    rush(),
  ],

  hats: [
    { id: 'hatStyle', type: 'choice', label: 'Hat style', group: 'style', required: true, default: 'baseball',
      options: [
        { value: 'baseball', label: 'Baseball cap' },
        { value: 'trucker', label: 'Trucker' },
        { value: 'snapback', label: 'Snapback', price: 4 },
        { value: 'bucket', label: 'Bucket hat' },
        { value: 'beanie', label: 'Beanie' },
      ] },
    color('hatColor', 'Hat color', { required: true }),
    name(),
    text(),
    logoUpload(),
    theme(),
    rhinestones(),
    inspiration(),
    notes('Notes'),
    rush(),
  ],

  jackets: [
    audience(),
    sizeField('jacketSize', 'Jacket size', apparelSizes),
    { id: 'jacketType', type: 'choice', label: 'Jacket type', group: 'style', required: true, default: 'denim',
      options: [
        { value: 'denim', label: 'Denim' },
        { value: 'bomber', label: 'Bomber', price: 15 },
        { value: 'leather-look', label: 'Leather-look', price: 25 },
        { value: 'varsity', label: 'Varsity', price: 30 },
      ] },
    color('baseColor', 'Base color', { required: true }),
    { id: 'frontDesign', type: 'choice', label: 'Front design', group: 'personalize', default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'chest', label: 'Small chest design', price: 15 },
        { value: 'full', label: 'Full front', price: 25 },
      ] },
    { id: 'backDesign', type: 'choice', label: 'Back design', group: 'personalize', default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'standard', label: 'Standard back design', price: 20 },
        { value: 'large', label: 'Large back design', price: 35 },
      ] },
    { id: 'sleeveDesign', type: 'choice', label: 'Sleeve design', group: 'personalize', default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'one', label: 'One sleeve', price: 10 },
        { value: 'both', label: 'Both sleeves', price: 18 },
      ] },
    name(),
    logoUpload(),
    rhinestones(),
    inspiration('Upload images'),
    notes('Notes'),
    rush(),
  ],
};

/** Section headings, in display order */
export const GROUPS = [
  { id: 'fit', title: 'Size & fit' },
  { id: 'style', title: 'Style & color' },
  { id: 'personalize', title: 'Personalization' },
  { id: 'embellish', title: 'Embellishments' },
  { id: 'inspire', title: 'Inspiration & notes' },
  { id: 'extras', title: 'Extras' },
];
