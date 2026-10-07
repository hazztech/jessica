/**
 * Storefront product access. Reads the live catalog (managed in Admin → Products),
 * which starts from the sample data in seedProducts.js.
 */
import { catalog } from '../services/catalog.js';

export const allProducts = () => catalog.all();
export const activeProducts = () => catalog.all().filter((p) => p.active && !p.archived);
export const featuredProducts = () => activeProducts().filter((p) => p.featured);
export const getProductBySlug = (slug) => catalog.all().find((p) => p.slug === slug && !p.archived) || null;
