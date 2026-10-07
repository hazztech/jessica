/**
 * Product photography. Files live in /public/images/products as WebP:
 *   <slug>.webp (full size) and <slug>-600.webp (cards, thumbnails).
 * To add a photo: export JPG/PNG → WebP at ~1200px and 600px, drop both in the
 * folder, and reference it with photo('<slug>', 'description').
 */
const SIZES = {
  'black-pearl-bow-high-tops': [1122, 1402],
  'personalized-theme-jeans': [1122, 1402],
  'birthday-shirt-skirt-set': [1122, 1402],
  'music-patch-tie-beanie-set': [1122, 1402],
  'sweet-16-corset-fringe-jeans': [1122, 1402],
  'pearl-bling-clogs-tie-set': [1122, 1402],
  'crystal-patch-clogs': [1122, 1402],
  'statement-tie-trio': [1122, 1402],
  'denim-pocket-statement-tie': [1122, 1402],
  'silver-spike-high-tops': [1122, 1402],
  'pink-green-pearl-low-tops': [1122, 1402],
  'royal-blue-gold-pearl-low-tops': [1122, 1402],
  'personalized-ombre-tumbler': [1122, 1402],
  'character-tee-sneaker-set': [1254, 1254],
  'rainbow-crystal-sneakers': [1254, 1254],
  'pearl-chain-statement-tie': [1254, 1254],
  'toddler-bow-bling-sneakers': [1125, 1079],
  'beanie-crop': [702, 877],
};

export function photo(slug, alt) {
  const [width, height] = SIZES[slug] || [1200, 1500];
  return {
    url: `/images/products/${slug}.webp`,
    srcSet: `/images/products/${slug}-600.webp 600w, /images/products/${slug}.webp ${width}w`,
    width, height, alt,
  };
}
