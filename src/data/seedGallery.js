/** Gallery seed — Jessica's finished pieces. Managed in Admin → Gallery afterwards. */
import { photo } from './photos.js';

const g = (n, slug, title, category, description, featured = false) => ({
  id: `g-${String(n).padStart(3, '0')}`, title, category, description, featured, published: true,
  images: [photo(slug, title)], createdAt: new Date(Date.UTC(2026, 8, 30 - n)).toISOString(),
});

export const seedGallery = [
  g(1, 'black-pearl-bow-high-tops', 'Black pearl & crystal bow high-tops', 'shoes', 'Pearls, jet crystals, a crystal toe and a hand-set rhinestone bow.', true),
  g(2, 'sweet-16-corset-fringe-jeans', 'Sweet 16 corset & fringe jeans', 'outfits', 'Satin corset with pink fringe jeans, glitter lettering and her birthday year.', true),
  g(3, 'pearl-chain-statement-tie', 'Pearl & chain statement tie', 'ties', 'Layered pearls, silver chains, brooches and an embroidered patch.', true),
  g(4, 'rainbow-crystal-sneakers', 'Rainbow crystal sneakers', 'shoes', 'Yellow pearls with confetti crystals and a rainbow rhinestone toe.'),
  g(5, 'birthday-shirt-skirt-set', 'Birthday girl shirt & skirt set', 'outfits', 'Personalized with her name, age and zodiac sign.', true),
  g(6, 'music-patch-tie-beanie-set', 'Music patch beanie & tie', 'hats', 'Embroidered guitar, record and cassette patches with gold studs and pearl flowers.'),
  g(7, 'personalized-ombre-tumbler', 'Personalized ombré tumbler', 'tumblers', 'Two-tone 40 oz tumbler with bold name lettering.'),
  g(8, 'royal-blue-gold-pearl-low-tops', 'Royal blue & gold pearl low-tops', 'shoes', 'Team colors in pearls with a crystal toe and satin laces.'),
  g(9, 'statement-tie-trio', 'Statement tie trio', 'ties', 'Black satin, purple twill and leopard print — each finished by hand.'),
  g(10, 'crystal-patch-clogs', 'Crystal & pearl patch clogs', 'shoes', 'Fully encrusted clogs with rhinestone straps and embroidered patches.'),
  g(11, 'character-tee-sneaker-set', 'Matching graphic tee & sneakers', 'shirts', 'A coordinated tee and hand-finished sneaker set.'),
  g(12, 'personalized-theme-jeans', 'Personalized theme jeans', 'outfits', 'Name, year and favorite theme for a big milestone.'),
  g(13, 'pink-green-pearl-low-tops', 'Pink & green pearl low-tops', 'shoes', 'Pink and white pearls with emerald crystals and a crystal year.'),
  g(14, 'denim-pocket-statement-tie', 'Denim pocket statement tie', 'ties', 'Camel satin with a crystal-trimmed denim pocket and gold charms.'),
  g(15, 'pearl-bling-clogs-tie-set', 'Pearl bling clogs & matching tie', 'shoes', 'Red pearl clogs with a coordinating satin tie.'),
  g(16, 'silver-spike-high-tops', 'Silver spike high-tops', 'shoes', 'Hand-set cone spikes with a polished stud toe.'),
  g(17, 'toddler-bow-bling-sneakers', 'Toddler bow & bling sneakers', 'shoes', 'Crystal toes, pearl sides and oversized ribbon bows for little feet.'),
];
