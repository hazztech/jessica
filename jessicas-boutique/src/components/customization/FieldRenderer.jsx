import { getOptions, isRequired, todayISO } from '../../lib/customization.js';
import { formatAddon } from '../../lib/format.js';
import UploadField from '../UploadField.jsx';

/**
 * Renders any schema field. Add a new field type here once and every form gets it.
 * `ns` namespaces element ids so two categories' fields can share a page.
 */
export default function FieldRenderer({ field, values, error, onChange, ns = '' }) {
  const value = values[field.id];
  const set = (v) => onChange(field.id, v);
  const key = `${ns}${field.id}`;
  const ids = { input: `cz-${key}`, help: `cz-${key}-help`, error: `cz-${key}-err`, name: key };
  const describedBy = [field.help && ids.help, error && ids.error].filter(Boolean).join(' ') || undefined;
  const required = isRequired(field, values);
  const common = { field, value, set, ids, describedBy, error, required, options: getOptions(field, values) };

  let control;
  switch (field.type) {
    case 'choice': control = <ChoiceField {...common} />; break;
    case 'multichoice': control = <ChoiceField {...common} multiple />; break;
    case 'swatch': control = <SwatchField {...common} />; break;
    case 'multiswatch': control = <SwatchField {...common} multiple />; break;
    case 'select': control = <SelectField {...common} />; break;
    case 'toggle': control = <ToggleField {...common} />; break;
    case 'checkbox': control = <CheckboxField {...common} />; break;
    case 'upload': control = (
      <UploadField id={ids.input} label={field.label} help={field.help} value={value || []} onChange={set}
        accept={field.accept} maxFiles={field.maxFiles} maxSizeMB={field.maxSizeMB}
        price={field.price} required={required} error={error} />
    ); break;
    default: control = <TextField {...common} />;
  }

  return (
    <div className={`cz-field cz-field--${field.type} ${error ? 'has-error' : ''}`} id={`field-${key}`}>
      {control}
      {field.help && field.type !== 'upload' && <p className="cz-help" id={ids.help}>{field.help}</p>}
      {error && field.type !== 'upload' && <p className="cz-error" id={ids.error} role="alert">{error}</p>}
    </div>
  );
}

export const PriceTag = ({ amount }) => (amount ? <span className="cz-price">+{formatAddon(amount)}</span> : null);
const Req = ({ on }) => (on ? <span className="cz-req">Required</span> : null);

function FieldLabel({ field, required, htmlFor, as: Tag = 'label', extra }) {
  return (
    <Tag className="cz-label" {...(htmlFor ? { htmlFor } : {})}>
      <span>{field.label}</span>
      {extra}
      <Req on={required} />
      {['text', 'number', 'date', 'textarea'].includes(field.type) && <PriceTag amount={field.price} />}
    </Tag>
  );
}

function ChoiceField({ field, value, set, ids, describedBy, error, options, required, multiple }) {
  const list = multiple ? value || [] : null;
  const isOn = (v) => (multiple ? list.includes(v) : value === v);
  const toggle = (v) => (multiple ? set(isOn(v) ? list.filter((x) => x !== v) : [...list, v]) : set(v));
  return (
    <fieldset className="cz-fieldset" aria-describedby={describedBy} aria-invalid={!!error || undefined}>
      <FieldLabel field={field} required={required} as="legend" />
      <div className="cz-chips">
        {options.map((o) => (
          <label key={o.value} className={`cz-chip ${isOn(o.value) ? 'is-selected' : ''}`}>
            <input type={multiple ? 'checkbox' : 'radio'} name={ids.name} value={o.value}
              checked={isOn(o.value)} onChange={() => toggle(o.value)} />
            <span className="cz-chip__label">{o.label}</span>
            <PriceTag amount={o.price} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SwatchField({ field, value, set, ids, describedBy, error, options, required, multiple }) {
  const list = multiple ? value || [] : null;
  const isOn = (v) => (multiple ? list.includes(v) : value === v);
  const toggle = (v) => (multiple ? set(isOn(v) ? list.filter((x) => x !== v) : [...list, v]) : set(v));
  const chosen = options.filter((o) => isOn(o.value)).map((o) => o.label);
  return (
    <fieldset className="cz-fieldset" aria-describedby={describedBy} aria-invalid={!!error || undefined}>
      <FieldLabel field={field} required={required} as="legend"
        extra={<span className="cz-selected">{chosen.length ? chosen.join(', ') : multiple ? 'Choose colors' : 'Choose a color'}</span>} />
      <div className="cz-swatches">
        {options.map((o) => (
          <label key={o.value} className={`cz-swatch ${isOn(o.value) ? 'is-selected' : ''}`} title={o.label}>
            <input type={multiple ? 'checkbox' : 'radio'} name={ids.name} value={o.value} checked={isOn(o.value)}
              onChange={() => toggle(o.value)} aria-label={o.label} />
            <span className={`cz-swatch__dot ${o.hex ? '' : 'cz-swatch__dot--other'}`}
              style={o.hex ? { '--swatch': o.hex } : undefined} aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField({ field, value, set, ids, describedBy, error, options, required }) {
  const groups = [...new Set(options.map((o) => o.group).filter(Boolean))];
  const opt = (o) => (
    <option key={o.value} value={o.value}>{o.label}{o.price ? ` (+${formatAddon(o.price)})` : ''}</option>
  );
  return (
    <>
      <FieldLabel field={field} required={required} htmlFor={ids.input} />
      <div className="cz-select">
        <select id={ids.input} value={value || ''} onChange={(e) => set(e.target.value)} autoComplete={field.autoComplete}
          aria-describedby={describedBy} aria-invalid={!!error || undefined} aria-required={required || undefined}>
          <option value="">{field.placeholder || 'Choose one'}</option>
          {groups.length
            ? groups.map((g) => <optgroup key={g} label={g}>{options.filter((o) => o.group === g).map(opt)}</optgroup>)
            : options.map(opt)}
        </select>
      </div>
    </>
  );
}

function TextField({ field, value, set, ids, describedBy, error, required }) {
  const v = value || '';
  const props = {
    id: ids.input, value: v, placeholder: field.placeholder,
    maxLength: field.maxLength, autoComplete: field.autoComplete, enterKeyHint: field.enterKeyHint,
    spellCheck: field.inputType === 'email' || field.inputType === 'tel' || field.format ? false : undefined,
    autoCapitalize: field.inputType === 'email' ? 'none' : field.autoCapitalize,
    'aria-describedby': describedBy, 'aria-invalid': !!error || undefined, 'aria-required': required || undefined,
    onChange: (e) => set(field.type === 'number' ? e.target.value.replace(/\D/g, '') : e.target.value),
  };
  const inputType = field.type === 'date' ? 'date' : field.inputType || 'text';
  return (
    <>
      <FieldLabel field={field} required={required} htmlFor={ids.input} />
      {field.type === 'textarea' ? (
        <textarea className="cz-input cz-input--area" rows={field.rows || 4} {...props} />
      ) : (
        <input className="cz-input" type={inputType}
          min={field.type === 'date' && field.min === 'today' ? todayISO() : undefined}
          inputMode={field.inputMode || (field.type === 'number' ? 'numeric' : inputType === 'tel' ? 'tel' : inputType === 'email' ? 'email' : undefined)}
          {...props}
          autoCapitalize={field.transform === 'upper' ? 'characters' : props.autoCapitalize} />
      )}
      {field.maxLength && ['text', 'textarea'].includes(field.type) && !field.inputType && !field.hideCount && (
        <span className="cz-count" aria-hidden="true">{v.length}/{field.maxLength}</span>
      )}
    </>
  );
}

function ToggleField({ field, value, set, ids, describedBy }) {
  return (
    <label className="cz-toggle" htmlFor={ids.input}>
      <input id={ids.input} type="checkbox" role="switch" checked={!!value}
        onChange={(e) => set(e.target.checked)} aria-describedby={describedBy} />
      <span className="cz-toggle__track" aria-hidden="true"><span className="cz-toggle__thumb" /></span>
      <span className="cz-toggle__label">{field.label}</span>
      <PriceTag amount={field.price} />
    </label>
  );
}

function CheckboxField({ field, value, set, ids, describedBy, error, required }) {
  return (
    <label className="cz-check" htmlFor={ids.input}>
      <input id={ids.input} type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)}
        aria-describedby={describedBy} aria-invalid={!!error || undefined} aria-required={required || undefined} />
      <span className="cz-check__box" aria-hidden="true" />
      <span className="cz-check__label">{field.label}</span>
    </label>
  );
}
