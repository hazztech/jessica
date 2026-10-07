const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = (n) => usd.format(Number(n) || 0);

/** Effective price — sale price wins when set and lower. */
export const effectivePrice = (p) =>
  p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;

const usdWhole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
/** Compact add-on price for option tags: 15 → "$15", 2.5 → "$2.50" */
export const formatAddon = (n) => (Number.isInteger(Number(n)) ? usdWhole.format(n) : usd.format(n));
