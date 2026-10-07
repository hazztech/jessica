import ProductArt from './ProductArt.jsx';

/** Step 1 — choose one or more item types (checkbox cards). */
export default function ItemTypePicker({ types, value, onChange, error }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <fieldset className="types" aria-describedby={error ? 'types-err' : undefined}>
      <legend className="visually-hidden">Item type — choose one or more</legend>
      <div className="types__grid">
        {types.map((t) => {
          const on = value.includes(t.id);
          return (
            <label key={t.id} className={`types__card ${on ? 'is-selected' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => toggle(t.id)} />
              <span className="types__art"><ProductArt category={t.id} shadow={false} /></span>
              <span className="types__name">{t.name}</span>
              <span className="types__check" aria-hidden="true" />
            </label>
          );
        })}
      </div>
      {error && <p className="cz-error" id="types-err" role="alert">{error}</p>}
    </fieldset>
  );
}
