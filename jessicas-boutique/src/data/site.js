export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Custom Orders', to: '/custom-orders' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const valueStatements = [
  { icon: 'diamond', text: 'One of a kind designs' },
  { icon: 'sparkle', text: 'High quality custom pieces' },
  { icon: 'heart', text: 'Made with love' },
  { icon: 'gift', text: 'For every occasion' },
];

export const howItWorks = [
  { title: 'Share Your Ideas',
    text: 'Tell us what you have in mind — style, colors, details and inspiration.' },
  { title: 'We Design It',
    text: 'Jessica works with your vision to create the perfect custom concept.' },
  { title: 'We Create It',
    text: 'Your item is carefully handcrafted and customized.' },
  { title: 'You Shine',
    text: 'Receive your one-of-a-kind creation.' },
];

/** SAMPLE testimonials — replace with real customer reviews before launch. */
export const testimonials = [
  { quote: 'My daughter’s birthday sneakers were even prettier in person. Every crystal was perfect.',
    name: 'Sample Customer', detail: 'Custom sneakers' },
  { quote: 'Jessica matched our wedding colors exactly on the groomsmen ties. Everyone asked where we got them.',
    name: 'Sample Customer', detail: 'Wedding ties' },
  { quote: 'I sent one screenshot and she turned it into the tumbler I’d been picturing for months.',
    name: 'Sample Customer', detail: 'Photo tumbler' },
];

import { photo } from './photos.js';

/**
 * Hero photography: one large arched photo plus small accent cards so the
 * hero always shows a mix of products (not only shoes). Set to null to use
 * the built-in illustrated flat-lay instead.
 */
export const heroPhotos = {
  main: photo('black-pearl-bow-high-tops', 'Black pearl and crystal high-top sneakers with a rhinestone bow'),
  accents: [
    { image: photo('birthday-shirt-skirt-set', 'Personalized birthday shirt and pleated skirt'), label: 'Outfits', to: '/shop?category=outfits' },
    { image: photo('pearl-chain-statement-tie', 'Pearl and chain statement tie'), label: 'Ties', to: '/shop?category=ties' },
    { image: photo('personalized-ombre-tumbler', 'Personalized ombré tumbler'), label: 'Tumblers', to: '/shop?category=tumblers' },
  ],
};
