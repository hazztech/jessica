import ComingSoon from './ComingSoon.jsx';
import { getProductBySlug } from '../data/products.js';

export default function ProductPlaceholder({ slug }) {
  const product = getProductBySlug(slug);
  if (!product) return <ComingSoon title="We couldn’t find that product" accent="oh no">It may have sold out or moved. Try the shop, or ask Jessica to make it for you.</ComingSoon>;
  return (
    <ComingSoon title={product.name} accent="almost ready">
      The full product page — with photos, live pricing and {product.customizable ? 'customization options' : 'details'} — is
      the next build phase.
    </ComingSoon>
  );
}
