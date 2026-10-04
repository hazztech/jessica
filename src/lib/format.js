const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = (n) => usd.format(Number(n) || 0);

/** Effective price — sale price wins when set and lower. */
export const effectivePrice = (p) =>
  p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
