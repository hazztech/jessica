import { formatPrice } from '../lib/format.js';

/** Base price, each paid option, quantity, total — updates as options change. */
export default function PriceSummary({ price }) {
  return (
    <div className="price-summary">
      <dl>
        <div className="price-summary__row"><dt>Base price</dt><dd>{formatPrice(price.base)}</dd></div>
        {price.lines.map((l) => (
          <div key={l.fieldId} className="price-summary__row price-summary__row--addon">
            <dt>{l.label}</dt><dd>+{formatPrice(l.amount)}</dd>
          </div>
        ))}
        {price.lines.length > 0 && (
          <div className="price-summary__row price-summary__row--sub"><dt>Each</dt><dd>{formatPrice(price.unit)}</dd></div>
        )}
        <div className="price-summary__row"><dt>Quantity</dt><dd>× {price.quantity}</dd></div>
        <div className="price-summary__row price-summary__row--total">
          <dt>Total</dt>
          <dd aria-live="polite" aria-atomic="true">{formatPrice(price.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
