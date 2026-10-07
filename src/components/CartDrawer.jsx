import Modal from './Modal.jsx';
import Button from './Button.jsx';
import ProductImage from './ProductImage.jsx';
import QuantityStepper from './QuantityStepper.jsx';
import { Link } from '../lib/router.jsx';
import { useCart, lineTotal } from '../context/CartContext.jsx';
import { formatAddon, formatPrice } from '../lib/format.js';
import { hasFile } from '../lib/uploadStore.js';
import { CameraIcon, TrashIcon, BagIcon } from './icons.jsx';
import './CartDrawer.css';

const missingFiles = (line) =>
  Object.values(line.selections || {}).filter(Array.isArray).flat().some((f) => !hasFile(f.id));

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  const footer = items.length ? (
    <div className="cart__foot">
      <div className="cart__subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
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
          <Button to="/shop" full onClick={closeCart}>Shop Now</Button>
          <Button to="/custom-orders" variant="secondary" full onClick={closeCart}>Start a custom order</Button>
        </div>
      ) : (
        <ul role="list" className="cart__lines">
          {items.map((line) => {
            const editUrl = `/product/${line.slug}?edit=${line.lineId}`;
            const details = (line.summary || []).filter((s) => !s.files || s.price);
            const lost = line.uploadCount > 0 && missingFiles(line);
            return (
              <li key={line.lineId} className="cart-line">
                <Link to={`/product/${line.slug}`} onClick={closeCart} className="cart-line__img" tabIndex={-1} aria-hidden="true">
                  <ProductImage image={line.image} category={line.category} />
                </Link>
                <div className="cart-line__info">
                  <Link to={`/product/${line.slug}`} onClick={closeCart} className="cart-line__name">{line.name}</Link>
                  <p className="cart-line__meta">Base price {formatPrice(line.basePrice)}</p>

                  {details.length > 0 && (
                    <dl className="cart-line__opts">
                      {details.map((s) => (
                        <div key={s.fieldId}>
                          <dt>{s.label}</dt>
                          <dd>
                            {s.hex && <span className="cart-line__dot" style={{ background: s.hex }} aria-hidden="true" />}
                            {s.value}
                            {s.price ? <span className="cart-line__addon">+{formatAddon(s.price)}</span> : null}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {line.uploadCount > 0 && (
                    <p className={`cart-line__flag ${lost ? 'is-warn' : ''}`}>
                      <CameraIcon size={16} />
                      {lost
                        ? 'Files need re-attaching — tap Edit'
                        : `${line.uploadCount} file${line.uploadCount > 1 ? 's' : ''} attached`}
                    </p>
                  )}

                  {line.selections && Object.keys(line.selections).length > 0 && (
                    <Link to={editUrl} onClick={closeCart} className="cart-line__edit">Edit</Link>
                  )}

                  <div className="cart-line__row">
                    <QuantityStepper value={line.quantity} label={`Quantity for ${line.name}`}
                      onChange={(q) => updateQuantity(line.lineId, q)} />
                    <span className="cart-line__total">
                      <strong>{formatPrice(lineTotal(line))}</strong>
                      {line.quantity > 1 && <small>{formatPrice(line.unitPrice)} each</small>}
                    </span>
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
