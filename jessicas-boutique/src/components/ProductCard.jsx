import { Link } from '../lib/router.jsx';
import Button from './Button.jsx';
import ProductImage from './ProductImage.jsx';
import { BagIcon, HeartIcon } from './icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice, effectivePrice } from '../lib/format.js';
import { buildCartLine, canQuickAdd, defaultValues, resolveSchema } from '../lib/customization.js';
import './ProductCard.css';

/** Image and name open product details; Customize It is the main action. */
export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const url = `/product/${product.slug}`;
  const wished = has(product.id);
  const onSale = product.salePrice != null && product.salePrice < product.price;

  const quick = canQuickAdd(product);
  const add = () => {
    const fields = resolveSchema(product);
    addItem(buildCartLine(product, fields, defaultValues(fields), 1));
    toast(`${product.name} added to your cart`, { action: { label: 'View cart', onClick: openCart } });
  };
  const wish = () => {
    toggle(product.id);
    toast(wished ? 'Removed from your wishlist' : 'Saved to your wishlist');
  };

  return (
    <article className="pcard">
      <div className="pcard__media">
        <Link to={url} tabIndex={-1} aria-hidden="true" className="pcard__imglink">
          <ProductImage image={product.images[0]} category={product.category} shape="portrait" />
        </Link>
        <button type="button" className={`pcard__wish ${wished ? 'is-on' : ''}`} onClick={wish}
          aria-pressed={wished} aria-label={`Save ${product.name} to wishlist`}>
          <HeartIcon filled={wished} size={18} />
        </button>
      </div>

      <div className="pcard__body">
        <h3 className="pcard__name"><Link to={url}>{product.name}</Link></h3>
        <p className="pcard__price">
          {onSale && <s className="pcard__was">{formatPrice(product.price)}</s>}
          <span>{formatPrice(effectivePrice(product))}</span>
        </p>
        <div className="pcard__actions">
          {product.customizable ? (
            <>
              <Button size="sm" full to={`${url}?customize=1`}>Customize It</Button>
              {quick && (
                <button type="button" className="pcard__add" onClick={add}
                  aria-label={`Add ${product.name} to cart with standard options`}>
                  <BagIcon size={19} />
                </button>
              )}
            </>
          ) : (
            <Button size="sm" full onClick={add}>Add To Cart</Button>
          )}
        </div>
      </div>
    </article>
  );
}
