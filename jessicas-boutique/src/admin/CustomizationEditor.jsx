import { customizationSchemas, GROUPS } from '../data/customizationSchemas.js';
import { uid } from '../lib/localDb.js';

/**
 * Per-product customization settings on top of the category schema:
 * turn fields/options on or off, override prices, and add product-only
 * add-ons or option lists. Writes product.customization (see resolveSchema).
 */
export default function CustomizationEditor({ category, value = {}, onChange }) {
  const fields = customizationSchemas[category] || [];
  const disabled = new Set(value.disabledFields || []);
  const disabledOpts = value.disabledOptions || {};
  const prices = value.priceOverrides || {};
  const extras = value.extraOptions || [];
  const set = (patch) => onChange({ ...value, ...patch });

  const toggleField = (id) => set({ disabledFields: disabled.has(id) ? [...disabled].filter((x) => x !== id) : [...disabled, id] });
  const toggleOption = (fid, ov) => {
    const cur = new Set(disabledOpts[fid] || []);
    cur.has(ov) ? cur.delete(ov) : cur.add(ov);
    set({ disabledOptions: { ...disabledOpts, [fid]: [...cur] } });
  };
  const setPrice = (key, v) => {
    const next = { ...prices };
    if (v === '') delete next[key];
    else next[key] = Math.max(0, Number(v) || 0);
    set({ priceOverrides: next });
  };
  const optionsOf = (f) => {
    if (f.options) return f.options;
    if (!f.optionsBy) return [];
    const seen = new Map();
    Object.values(f.optionsBy.map).flat().forEach((o) => seen.set(o.value, o));
    return [...seen.values()];
  };

  const updateExtra = (id, patch) => set({ extraOptions: extras.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const removeExtra = (id) => set({ extraOptions: extras.filter((x) => x.id !== id) });

  if (!category) return <p className="admin-empty">Choose a category first — its customization options will appear here.</p>;

  return (
    <div className="cedit">
      <p className="cz-help">
        These options come from the {category} template. Untick anything that doesn’t apply to this product,
        and change prices for this product only. Leave a price blank to use the default.
      </p>

      {GROUPS.map((g) => {
        const list = fields.filter((f) => f.group === g.id);
        if (!list.length) return null;
        return (
          <fieldset key={g.id} className="cedit__group">
            <legend>{g.title}</legend>
            {list.map((f) => {
              const on = !disabled.has(f.id);
              const opts = optionsOf(f);
              const pricedOpts = ['choice', 'select'].includes(f.type) && f.id !== 'audience' && opts.length <= 12;
              return (
                <div key={f.id} className={`cedit__field ${on ? '' : 'is-off'}`}>
                  <div className="cedit__row">
                    <label className="cedit__check">
                      <input type="checkbox" checked={on} onChange={() => toggleField(f.id)} />
                      <span>{f.label}</span>
                      {f.required && <span className="cz-req">Required</span>}
                    </label>
                    {f.price != null && on && (
                      <PriceInput label={`${f.label} price`} def={f.price} value={prices[f.id]} onChange={(v) => setPrice(f.id, v)} />
                    )}
                  </div>
                  {on && pricedOpts && (
                    <ul role="list" className="cedit__opts">
                      {opts.map((o) => {
                        const key = `${f.id}.${o.value}`;
                        const optOn = !(disabledOpts[f.id] || []).includes(o.value);
                        return (
                          <li key={o.value} className={optOn ? '' : 'is-off'}>
                            <label className="cedit__check cedit__check--sm">
                              <input type="checkbox" checked={optOn} onChange={() => toggleOption(f.id, o.value)}
                                disabled={o.value === f.default && optOn} />
                              <span>{o.label}</span>
                            </label>
                            {optOn && o.value !== 'none' && (
                              <PriceInput label={`${o.label} price`} def={o.price || 0} value={prices[key]} onChange={(v) => setPrice(key, v)} />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </fieldset>
        );
      })}

      <fieldset className="cedit__group">
        <legend>Extra options for this product</legend>
        {extras.length === 0 && <p className="cz-help">Add a paid add-on (like gift wrapping) or your own list of choices.</p>}
        {extras.map((x) => (
          <div key={x.id} className="cedit__extra">
            <div className="cedit__extra-head">
              <span className="cedit__kind">{x.kind === 'addon' ? 'Add-on' : 'Option list'}</span>
              <button type="button" className="atable__btn atable__btn--danger" onClick={() => removeExtra(x.id)}>Remove</button>
            </div>
            <div className="cedit__extra-row">
              <label className="cedit__grow">
                <span className="cz-label">Label</span>
                <input className="cz-input" value={x.label} maxLength={60} placeholder={x.kind === 'addon' ? 'e.g. Gift box' : 'e.g. Lace style'}
                  onChange={(e) => updateExtra(x.id, { label: e.target.value })} />
              </label>
              {x.kind === 'addon' && (
                <PriceInput label="Price" visibleLabel def={0} value={x.price} onChange={(v) => updateExtra(x.id, { price: v === '' ? 0 : Number(v) })} />
              )}
            </div>
            {x.kind === 'choice' && (
              <>
                <ul role="list" className="cedit__opts">
                  {(x.options || []).map((o, i) => (
                    <li key={i}>
                      <input className="cz-input" value={o.label} maxLength={40} placeholder={`Choice ${i + 1}`}
                        aria-label={`Choice ${i + 1} name`}
                        onChange={(e) => updateExtra(x.id, { options: x.options.map((y, k) => (k === i ? { ...y, label: e.target.value } : y)) })} />
                      <PriceInput label={`Choice ${i + 1} price`} def={0} value={o.price}
                        onChange={(v) => updateExtra(x.id, { options: x.options.map((y, k) => (k === i ? { ...y, price: v === '' ? 0 : Number(v) } : y)) })} />
                      <button type="button" className="atable__btn" aria-label={`Remove choice ${i + 1}`}
                        onClick={() => updateExtra(x.id, { options: x.options.filter((_, k) => k !== i) })}>✕</button>
                    </li>
                  ))}
                </ul>
                <button type="button" className="atable__btn"
                  onClick={() => updateExtra(x.id, { options: [...(x.options || []), { value: uid('o'), label: '', price: 0 }] })}>
                  + Add choice
                </button>
                <label className="cedit__check cedit__check--sm">
                  <input type="checkbox" checked={!!x.required} onChange={(e) => updateExtra(x.id, { required: e.target.checked })} />
                  <span>Customer must choose one</span>
                </label>
              </>
            )}
          </div>
        ))}
        <div className="cedit__add">
          <button type="button" className="btn btn--secondary btn--sm"
            onClick={() => set({ extraOptions: [...extras, { id: uid(), kind: 'addon', label: '', price: 0 }] })}>+ Add-on</button>
          <button type="button" className="btn btn--secondary btn--sm"
            onClick={() => set({ extraOptions: [...extras, { id: uid(), kind: 'choice', label: '', options: [{ value: uid('o'), label: '', price: 0 }] }] })}>+ Option list</button>
        </div>
      </fieldset>
    </div>
  );
}

function PriceInput({ label, def, value, onChange, visibleLabel }) {
  return (
    <label className="cedit__price">
      {visibleLabel ? <span className="cz-label">{label}</span> : <span className="visually-hidden">{label}</span>}
      <span className="cedit__money">
        <span aria-hidden="true">+$</span>
        <input inputMode="decimal" value={value ?? ''} placeholder={String(def)}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))} />
      </span>
    </label>
  );
}
