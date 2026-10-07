/**
 * Product categories — SAMPLE DATA.
 * Will be managed from the admin dashboard (productCategories table).
 * Categories without a photo yet (socks, jackets) show studio-render art.
 */
import { photo } from './photos.js';

export const categories = [
  { id: 'shoes', name: 'Shoes', slug: 'shoes', image: photo('black-pearl-bow-high-tops', 'Black pearl and crystal bow high-top sneakers'),
    description: 'Pearl, crystal and studded sneakers and clogs, hand-finished in your colors.' },
  { id: 'outfits', name: 'Outfits', slug: 'outfits', image: photo('birthday-shirt-skirt-set', 'Personalized birthday shirt and pleated skirt set'),
    description: 'Coordinated sets, corsets and jeans for birthdays, Sweet 16s and big days.' },
  { id: 'shirts', name: 'Shirts', slug: 'shirts', image: photo('character-tee-sneaker-set', 'Custom graphic tee with matching sneakers'),
    description: 'Names, logos and artwork on tees for every age.' },
  { id: 'ties', name: 'Ties', slug: 'ties', image: photo('pearl-chain-statement-tie', 'Black satin statement tie with pearls and brooches'),
    description: 'Statement ties with pearls, brooches, chains and patches.' },
  { id: 'tumblers', name: 'Tumblers', slug: 'tumblers', image: photo('personalized-ombre-tumbler', 'Personalized ombré tumbler with a name'),
    description: 'Ombré, glitter and rhinestone tumblers with your name.' },
  { id: 'socks', name: 'Socks', slug: 'socks', image: null,
    description: 'Fun custom socks for teams, parties and gifts.' },
  { id: 'hats', name: 'Hats', slug: 'hats', image: photo('beanie-crop', 'Knit beanie with embroidered music patches and gold studs'),
    description: 'Beanies and caps with patches, studs, crystals and your name.' },
  { id: 'jackets', name: 'Jackets', slug: 'jackets', image: null,
    description: 'Denim and more with custom front and back designs.' },
];

export const getCategory = (id) => categories.find((c) => c.id === id);
