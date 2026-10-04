/**
 * Product categories — SAMPLE DATA.
 * Will be managed from the admin dashboard (productCategories table).
 * `image` is null until real photos are added; cards show brand placeholder art.
 */
export const categories = [
  { id: 'shoes', name: 'Shoes', slug: 'shoes', image: null,
    description: 'Statement sneakers and heels, hand-finished in your colors.' },
  { id: 'outfits', name: 'Outfits', slug: 'outfits', image: null,
    description: 'Coordinated sets and tutus for birthdays, pageants and big days.' },
  { id: 'shirts', name: 'Shirts', slug: 'shirts', image: null,
    description: 'Names, logos and artwork on tees for every age.' },
  { id: 'ties', name: 'Ties', slug: 'ties', image: null,
    description: 'Crystal-accented ties for weddings, prom and dapper kids.' },
  { id: 'tumblers', name: 'Tumblers', slug: 'tumblers', image: null,
    description: 'Glitter and rhinestone tumblers with names and photos.' },
  { id: 'socks', name: 'Socks', slug: 'socks', image: null,
    description: 'Fun custom socks for teams, parties and gifts.' },
  { id: 'hats', name: 'Hats', slug: 'hats', image: null,
    description: 'Bling caps and hats with your name, logo or theme.' },
  { id: 'jackets', name: 'Jackets', slug: 'jackets', image: null,
    description: 'Denim and more with custom front and back designs.' },
];

export const getCategory = (id) => categories.find((c) => c.id === id);
