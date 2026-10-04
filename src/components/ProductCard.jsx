import { Link } from '../lib/router.jsx';
import Button from './Button.jsx';
import ProductImage from './ProductImage.jsx';
import { HeartIcon } from './icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice, effectivePrice } from '../lib/format.js';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const url = `/product/${product.slug}`;
  const wished = has(product.id);
  const onSale = product.salePrice != null && product.salePrice < product.price;

  const add = () => {
    addItem({ product });
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
          <ProductImage image={product.images[0]} category={product.category} />
        </Link>
        {product.customizable && <span className="pcard__badge">Customizable</span>}
        <button type="button" className={`pcard__wish ${wished ? 'is-on' : ''}`} onClick={wish}
          aria-pressed={wished} aria-label={`Save ${product.name} to wishlist`}>
          <HeartIcon filled={wished} size={20} />
        </button>
      </div>

      <div className="pcard__body">
        <h3 className="pcard__name"><Link to={url}>{product.name}</Link></h3>
        <p className="pcard__price">
          {onSale && <s className="pcard__was">{formatPrice(product.price)}</s>}
          <span>{formatPrice(effectivePrice(product))}</span>
        </p>
        <div className="pcard__actions">
          <Button size="sm" full onClick={add}>Add To Cart</Button>
          {product.customizable && (
            <Button size="sm" full variant="secondary" to={`${url}?customize=1`}>Customize It</Button>
          )}
        </div>
        <Link to={url} className="pcard__details">View Details</Link>
      </div>
    </article>
  );
}
