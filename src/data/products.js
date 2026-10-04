/**
 * Products — SAMPLE DATA. Every field here will be editable from the admin
 * dashboard (products, productImages, productVariants,
 * productCustomizationOptions tables). Prices are placeholders.
 */
const now = '2026-10-01T00:00:00.000Z';

const base = {
  salePrice: null,
  images: [],          // [{ url, alt, width, height }] once photos are uploaded
  video: null,
  active: true,
  inventory: null,     // null = made to order
  customizationOptions: [], // filled per category in the Product Detail phase
  createdAt: now,
  updatedAt: now,
};

export const products = [
  { ...base, id: 'p-001', slug: 'mint-glam-custom-sneakers', name: 'Mint Glam Custom Sneakers',
    category: 'shoes', price: 145, featured: true, customizable: true,
    description: 'Hand-crystallized sneakers in mint and silver, customized with your colors and initials.',
    sizes: ['Women', 'Men', 'Kids', 'Youth'], colors: ['mint', 'silver', 'white'],
    estimatedProductionTime: '2–3 weeks', addOns: ['extra-rhinestones', 'custom-name', 'rush-order'],
    occasions: ['Birthdays', 'Prom', 'Everyday'], popularity: 98 },
  { ...base, id: 'p-002', slug: 'custom-tutu-outfit-set', name: 'Custom Tutu Outfit Set',
    category: 'outfits', price: 95, featured: true, customizable: true,
    description: 'A coordinated top and tutu set themed to your celebration.',
    sizes: ['Kids', 'Youth'], colors: ['mint', 'white', 'silver'],
    estimatedProductionTime: '2–3 weeks', addOns: ['custom-name', 'premium-embellishment', 'rush-order'],
    occasions: ['Birthdays', 'Holidays'], popularity: 91 },
  { ...base, id: 'p-003', slug: 'signature-custom-shirt', name: 'Signature Custom Shirt',
    category: 'shirts', price: 35, featured: true, customizable: true,
    description: 'Soft cotton tee with your text, name, logo or artwork.',
    sizes: ['Women', 'Men', 'Kids', 'Youth'], colors: ['white', 'charcoal', 'mint'],
    estimatedProductionTime: '1–2 weeks', addOns: ['custom-name', 'additional-design-area', 'rush-order'],
    occasions: ['Sports', 'Graduation', 'Everyday'], popularity: 88 },
  { ...base, id: 'p-004', slug: 'rhinestone-custom-tie', name: 'Rhinestone Custom Tie',
    category: 'ties', price: 40, featured: true, customizable: true,
    description: 'Classic tie finished with crystal accents in your chosen colors.',
    sizes: ['Men', 'Youth'], colors: ['silver', 'mint', 'charcoal'],
    estimatedProductionTime: '1–2 weeks', addOns: ['extra-rhinestones', 'initials'],
    occasions: ['Weddings', 'Prom', 'Graduation'], popularity: 74 },
  { ...base, id: 'p-005', slug: 'personalized-bling-tumbler', name: 'Personalized Bling Tumbler',
    category: 'tumblers', price: 38, featured: true, customizable: true,
    description: 'Glitter tumbler with your name, photo or theme, sealed for everyday use.',
    sizes: ['One Size'], colors: ['mint', 'silver', 'white'],
    estimatedProductionTime: '1–2 weeks', addOns: ['custom-name', 'extra-rhinestones', 'rush-order'],
    occasions: ['Birthdays', 'Holidays', 'Everyday'], popularity: 95 },
  { ...base, id: 'p-006', slug: 'custom-design-socks', name: 'Custom Design Socks',
    category: 'socks', price: 22, featured: true, customizable: true,
    description: 'Comfortable socks printed with your name, logo or design.',
    sizes: ['Women', 'Men', 'Kids', 'Youth'], colors: ['white', 'mint', 'charcoal'],
    estimatedProductionTime: '1–2 weeks', addOns: ['custom-name'],
    occasions: ['Sports', 'Holidays', 'Everyday'], popularity: 70 },
  { ...base, id: 'p-007', slug: 'custom-bling-hat', name: 'Custom Bling Hat',
    category: 'hats', price: 42, featured: true, customizable: true,
    description: 'Structured cap with crystal detailing and your name or logo.',
    sizes: ['One Size', 'Kids'], colors: ['white', 'charcoal', 'mint'],
    estimatedProductionTime: '1–2 weeks', addOns: ['extra-rhinestones', 'custom-name'],
    occasions: ['Sports', 'Everyday'], popularity: 80 },
  { ...base, id: 'p-008', slug: 'custom-denim-jacket', name: 'Custom Denim Jacket',
    category: 'jackets', price: 120, featured: true, customizable: true,
    description: 'Denim jacket with custom front and back designs, names and crystals.',
    sizes: ['Women', 'Men', 'Youth'], colors: ['silver', 'charcoal'],
    estimatedProductionTime: '3–4 weeks', addOns: ['premium-embellishment', 'additional-design-area', 'rush-order'],
    occasions: ['Birthdays', 'Holidays', 'Everyday'], popularity: 86 },
];

/** Add-ons — prices controlled by admin later. */
export const addOnCatalog = {
  'extra-rhinestones': { label: 'Extra rhinestones', price: 15 },
  'custom-name': { label: 'Custom name', price: 8 },
  initials: { label: 'Initials', price: 5 },
  'additional-artwork': { label: 'Additional artwork', price: 12 },
  'premium-embellishment': { label: 'Premium embellishment', price: 20 },
  'rush-order': { label: 'Rush order', price: 25 },
  'additional-design-area': { label: 'Additional design area', price: 10 },
};

export const activeProducts = () => products.filter((p) => p.active);
export const featuredProducts = () => activeProducts().filter((p) => p.featured);
export const getProductBySlug = (slug) => products.find((p) => p.slug === slug);
