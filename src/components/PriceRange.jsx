import { formatAddon } from '../lib/format.js';

/** Two-thumb price slider (two native range inputs — keyboard and touch friendly). */
export default function PriceRange({ lo, hi, min, max, onChange, step = 5 }) {
  const a = min ?? lo;
  const b = max ?? hi;
  const pct = (v) => ((v - lo) / (hi - lo)) * 100;
  const commit = (na, nb) => onChange(na <= lo ? null : na, nb >= hi ? null : nb);
  return (
    <div className="prange">
      <div className="prange__values" aria-hidden="true">
        <span>{formatAddon(a)}</span><span>{b >= hi ? `${formatAddon(hi)}+` : formatAddon(b)}</span>
      </div>
      <div className="prange__track" style={{ '--a': `${pct(a)}%`, '--b': `${pct(b)}%` }}>
        <input type="range" min={lo} max={hi} step={step} value={a} aria-label="Minimum price"
          aria-valuetext={formatAddon(a)}
          onChange={(e) => commit(Math.min(Number(e.target.value), b - step), b)} />
        <input type="range" min={lo} max={hi} step={step} value={b} aria-label="Maximum price"
          aria-valuetext={b >= hi ? 'No maximum' : formatAddon(b)}
          onChange={(e) => commit(a, Math.max(Number(e.target.value), a + step))} />
      </div>
    </div>
  );
}
