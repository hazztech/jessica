import { MinusIcon, PlusIcon } from './icons.jsx';

export default function QuantityStepper({ value, onChange, label = 'Quantity', min = 1, max = 99 }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        aria-label="Decrease quantity"><MinusIcon size={16} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        aria-label="Increase quantity"><PlusIcon size={16} /></button>
    </div>
  );
}
