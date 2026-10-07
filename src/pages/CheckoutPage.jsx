import { useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { useCart, lineTotal } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { contactFields, shippingFields, billingFields } from '../data/checkoutForm.js';
import { SHIPPING_METHODS, FREE_SHIPPING_AT, PAYMENTS_LIVE, applyCoupon, placeOrder, shippingCost, totals } from '../services/checkout.js';
import { cleanSelections, defaultValues, validate } from '../lib/customization.js';
import { formatPrice } from '../lib/format.js';
import FieldRenderer from '../components/customization/FieldRenderer.jsx';
import ProductImage from '../components/ProductImage.jsx';
import Button from '../components/Button.jsx';
import { BagIcon } from '../components/icons.jsx';
import '../components/customization/Customization.css';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const cart = useCart();
  const { navigate } = useRouter();
  const toast = useToast();
  const [contact, setContact] = useState(() => defaultValues(contactFields));
  const [ship, setShip] = useState(() => defaultValues(shippingFields));
  const [bill, setBill] = useState(() => defaultValues(billingFields));
  const [sameBilling, setSameBilling] = useState(true);
  const [method, setMethod] = useState('standard');
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [errors, setErrors] = useState({ contact: {}, ship: {}, bill: {} });
  const [placing, setPlacing] = useState(false);

  if (!cart.items.length) {
    return (
      <section className="ck ck--empty">
        <div className="container ck__empty">
          <span className="cart__empty-icon"><BagIcon size={34} /></span>
          <h1>Your cart is empty</h1>
          <p>Add something sparkly, then come back to check out.</p>
          <Button to="/shop">Shop Now</Button>
        </div>
      </section>
    );
  }

  const t = totals({ subtotal: cart.subtotal, shippingMethod: method, coupon });
  const set = (setter, key) => (id, v) => {
    setter((cur) => ({ ...cur, [id]: v }));
    if (errors[key][id]) setErrors((e) => ({ ...e, [key]: { ...e[key], [id]: undefined } }));
  };

  const redeem = async (e) => {
    e.preventDefault();
    setCodeError('');
    try { setCoupon(await applyCoupon(code)); setCode(''); } catch (err) { setCodeError(err.message); }
  };

  const submit = async (e) => {
    e?.preventDefault();
    const next = {
      contact: validate(contactFields, contact),
      ship: validate(shippingFields, ship),
      bill: sameBilling ? {} : validate(billingFields, bill),
    };
    setErrors(next);
    const firstKey = ['contact', 'ship', 'bill'].find((k) => Object.keys(next[k]).length);
    if (firstKey) {
      const id = Object.keys(next[firstKey])[0];
      const el = document.getElementById(`field-${firstKey === 'contact' ? '' : `${firstKey}-`}${id}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.querySelector('input, select')?.focus({ preventScroll: true });
      return;
    }
    setPlacing(true);
    try {
      const shippingAddress = cleanSelections(shippingFields, ship);
      const order = await placeOrder({
        items: cart.items,
        contact: cleanSelections(contactFields, contact),
        shippingAddress,
        billingAddress: sameBilling ? shippingAddress : cleanSelections(billingFields, bill),
        shippingMethod: method,
        coupon,
      });
      cart.clear();
      navigate(`/checkout/confirmation?order=${order.orderNumber}`);
    } catch (err) {
      console.error(err);
      toast('Your order couldn’t be placed. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <form className="ck" onSubmit={submit} noValidate>
      <div className="container ck__col">
        <h1 className="ck__title">Checkout</h1>

        {/* Order summary — collapsed on phones */}
        <details className="ck__summary">
          <summary>
            <span><BagIcon size={18} /> Order summary ({cart.count})</span>
            <strong>{formatPrice(t.total)}</strong>
          </summary>
          <ul role="list" className="ck__items">
            {cart.items.map((l) => (
              <li key={l.lineId}>
                <span className="ck__thumb"><ProductImage image={l.image} category={l.category} /><span className="ck__qty">{l.quantity}</span></span>
                <span className="ck__item">
                  <strong>{l.name}</strong>
                  {l.summary?.length > 0 && <span>{l.summary.filter((s) => !s.files).slice(0, 4).map((s) => s.value).join(' · ')}</span>}
                </span>
                <span className="ck__price">{formatPrice(lineTotal(l))}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="ck__edit" onClick={cart.openCart}>Edit cart</button>
        </details>

        <section className="ck__section" aria-labelledby="ck-contact">
          <h2 id="ck-contact">Contact</h2>
          <Fields fields={contactFields} values={contact} onChange={set(setContact, 'contact')} errs={errors.contact} />
        </section>

        <section className="ck__section" aria-labelledby="ck-ship">
          <h2 id="ck-ship">Shipping address</h2>
          <Fields fields={shippingFields} values={ship} onChange={set(setShip, 'ship')} errs={errors.ship} ns="ship-" />
        </section>

        <section className="ck__section" aria-labelledby="ck-method">
          <h2 id="ck-method">Shipping method</h2>
          <fieldset className="ck__methods">
            <legend className="visually-hidden">Shipping method</legend>
            {SHIPPING_METHODS.map((m) => {
              const cost = shippingCost(m.id, cart.subtotal);
              return (
                <label key={m.id} className={`ck__method ${method === m.id ? 'is-on' : ''}`}>
                  <input type="radio" name="ship-method" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span className="ck__radio" aria-hidden="true" />
                  <span className="ck__method-text"><strong>{m.label}</strong><span>{m.detail}</span></span>
                  <span className="ck__method-price">{cost === 0 ? 'Free' : formatPrice(cost)}</span>
                </label>
              );
            })}
          </fieldset>
          {method === 'standard' && cart.subtotal < FREE_SHIPPING_AT && (
            <p className="cz-help">Add {formatPrice(FREE_SHIPPING_AT - cart.subtotal)} more for free standard shipping.</p>
          )}
        </section>

        <section className="ck__section" aria-labelledby="ck-pay">
          <h2 id="ck-pay">Payment</h2>
          <div className="ck__secure">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <div>
              <strong>Secure payment</strong>
              <p>{PAYMENTS_LIVE
                ? 'Card, Apple Pay and Google Pay are processed securely by Stripe.'
                : 'Payments aren’t connected yet. In preview, placing an order records it without charging you.'}</p>
            </div>
          </div>
          <div id="stripe-payment-element" className="ck__stripe" aria-hidden={!PAYMENTS_LIVE}>
            {!PAYMENTS_LIVE && <span>Stripe payment form appears here</span>}
          </div>
          <label className="cz-check ck__same">
            <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} />
            <span className="cz-check__box" aria-hidden="true" />
            <span className="cz-check__label">Billing address is the same as shipping</span>
          </label>
          {!sameBilling && (
            <div className="ck__billing">
              <h3>Billing address</h3>
              <Fields fields={billingFields} values={bill} onChange={set(setBill, 'bill')} errs={errors.bill} ns="bill-" />
            </div>
          )}
        </section>

        <section className="ck__section" aria-labelledby="ck-total">
          <h2 id="ck-total">Review</h2>
          <div className="ck__code">
            {coupon ? (
              <p className="ck__applied">
                Code <strong>{coupon.code}</strong> applied
                <button type="button" onClick={() => setCoupon(null)}>Remove</button>
              </p>
            ) : (
              <div className="ck__code-row">
                <label className="visually-hidden" htmlFor="ck-code">Discount code</label>
                <input id="ck-code" className="cz-input" value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="Discount code" autoCapitalize="characters" autoComplete="off" spellCheck={false} enterKeyHint="go"
                  onKeyDown={(e) => { if (e.key === 'Enter') redeem(e); }}
                  aria-invalid={!!codeError || undefined} aria-describedby={codeError ? 'ck-code-err' : undefined} />
                <Button variant="secondary" onClick={redeem} disabled={!code.trim()}>Apply</Button>
              </div>
            )}
            {codeError && <p className="cz-error" id="ck-code-err" role="alert">{codeError}</p>}
          </div>
          <dl className="ck__totals">
            <div><dt>Subtotal</dt><dd>{formatPrice(t.subtotal)}</dd></div>
            {t.discount > 0 && <div className="ck__disc"><dt>Discount</dt><dd>−{formatPrice(t.discount)}</dd></div>}
            <div><dt>Shipping</dt><dd>{t.shipping === 0 ? 'Free' : formatPrice(t.shipping)}</dd></div>
            <div><dt>Estimated tax</dt><dd>{formatPrice(t.tax)}</dd></div>
            <div className="ck__grand"><dt>Total</dt><dd>{formatPrice(t.total)}</dd></div>
          </dl>
          <p className="cz-help">Custom pieces are made to order. Estimated production times are shown on each product.</p>
          <Button type="submit" size="lg" full disabled={placing} className="ck__place">
            {placing ? 'Placing order…' : `Place Order · ${formatPrice(t.total)}`}
          </Button>
          <Link to="/shop" className="ck__back">Continue shopping</Link>
        </section>
      </div>

      <div className="ck__sticky">
        <div className="ck__sticky-total"><span>Total</span><strong>{formatPrice(t.total)}</strong></div>
        <Button type="submit" size="lg" disabled={placing}>{placing ? 'Placing…' : 'Place Order'}</Button>
      </div>
    </form>
  );
}

/* Defined outside the page so inputs keep focus while typing */
function Fields({ fields, values, onChange, errs, ns = '' }) {
  return (
    <div className="ck__fields">
      {fields.map((f) => (
        <FieldRenderer key={f.id} field={f} values={values} error={errs[f.id]} onChange={onChange} ns={ns} />
      ))}
    </div>
  );
}
