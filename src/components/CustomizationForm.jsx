import FieldRenderer from './customization/FieldRenderer.jsx';
import { groupFields, isVisible } from '../lib/customization.js';
import './customization/Customization.css';

/** Renders a resolved schema as grouped sections. Pure: state lives in the page. */
export default function CustomizationForm({ fields, values, errors, onChange }) {
  const sections = groupFields(fields);
  return (
    <div className="cz">
      {sections.map((s) => {
        const visible = s.fields.filter((f) => isVisible(f, values));
        if (!visible.length) return null;
        return (
          <section key={s.id} className="cz-section" aria-labelledby={`cz-h-${s.id}`}>
            <h3 className="cz-section__title" id={`cz-h-${s.id}`}>{s.title}</h3>
            <div className="cz-section__fields">
              {visible.map((f) => (
                <FieldRenderer key={f.id} field={f} values={values} error={errors[f.id]} onChange={onChange} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
