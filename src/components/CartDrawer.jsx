import Modal from './Modal.jsx';
import Button from './Button.jsx';
import ProductImage from './ProductImage.jsx';
import { Link } from '../lib/router.jsx';
import { useCart, lineTotal } from '../context/CartContext.jsx';
import { formatPrice } from '../lib/format.js';
import { CameraIcon, MinusIcon, PlusIcon, TrashIcon, BagIcon } from './icons.jsx';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  const footer = items.length ? (
    <div className="cart__foot">
      <div className="cart__subtotal">
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
      <p className="cart__note">Shipping and taxes are calculated at checkout.</p>
      <Button to="/checkout" full size="lg" onClick={closeCart}>Checkout</Button>
      <Button variant="ghost" full onClick={closeCart}>Continue shopping</Button>
    </div>
  ) : null;

  return (
    <Modal open={isOpen} onClose={closeCart} title={`Your cart (${count})`} variant="right" footer={footer} className="cart">
      {items.length === 0 ? (
        <div className="cart__empty">
          <span className="cart__empty-icon"><BagIcon size={34} /></span>
          <p className="cart__empty-title">Your cart is empty</p>
          <p>Browse the collections, or tell Jessica about something one of a kind.</p>
          <Button to="/shop" full onClick={closeCart}>Shop now</Button>
          <Button to="/custom-orders" variant="secondary" full onClick={closeCart}>Start a custom order</Button>
        </div>
      ) : (
        <ul role="list" className="cart__lines">
          {items.map((line) => {
            const options = Object.entries(line.options || {});
            return (
              <li key={line.lineId} className="cart-line">
                <Link to={`/product/${line.slug}`} onClick={closeCart} className="cart-line__img" tabIndex={-1} aria-hidden="true">
                  <ProductImage image={line.image} category={line.category} />
                </Link>
                <div className="cart-line__info">
                  <Link to={`/product/${line.slug}`} onClick={closeCart} className="cart-line__name">{line.name}</Link>
                  <p className="cart-line__meta">Base price {formatPrice(line.basePrice)}</p>

                  {options.length > 0 && (
                    <dl className="cart-line__opts">
                      {options.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                    </dl>
                  )}
                  {line.personalization && <p className="cart-line__meta">Personalization: “{line.personalization}”</p>}
                  {line.addOns?.length > 0 && (
                    <p className="cart-line__meta">
                      Add-ons: {line.addOns.map((a) => `${a.label} (+${formatPrice(a.price)})`).join(', ')}
                    </p>
                  )}
                  {line.hasReferenceUploads && (
                    <p className="cart-line__flag"><CameraIcon size={16} /> Inspiration images attached</p>
                  )}
                  {line.isPlain && line.category && (
                    <Link to={`/product/${line.slug}?customize=1`} onClick={closeCart} className="cart-line__edit">
                      Add customization
                    </Link>
                  )}

                  <div className="cart-line__row">
                    <div className="qty" role="group" aria-label={`Quantity for ${line.name}`}>
                      <button type="button" onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                        disabled={line.quantity <= 1} aria-label="Decrease quantity"><MinusIcon size={16} /></button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        aria-label="Increase quantity"><PlusIcon size={16} /></button>
                    </div>
                    <strong className="cart-line__total">{formatPrice(lineTotal(line))}</strong>
                  </div>
                </div>
                <button type="button" className="icon-btn cart-line__remove" onClick={() => removeItem(line.lineId)}
                  aria-label={`Remove ${line.name} from cart`}>
                  <TrashIcon size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
