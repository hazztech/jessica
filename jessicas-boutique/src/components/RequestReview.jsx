import { getPreview } from '../lib/uploadStore.js';
import { getCategory } from '../data/categories.js';

/** Review screen — every answer, grouped, with a way back to each step. */
export default function RequestReview({ review, onEdit }) {
  const { itemTypes, vision, details, common, images, budget, contact } = review;
  return (
    <div className="review">
      <ReviewSection title="Item type" step={0} onEdit={onEdit}>
        <p>{itemTypes.map((id) => getCategory(id)?.name).join(', ')}</p>
      </ReviewSection>

      <ReviewSection title="Your vision" step={1} onEdit={onEdit}>
        <Rows rows={vision.filter((r) => r.fieldId !== 'description')} />
        {vision.find((r) => r.fieldId === 'description') && (
          <div className="review__desc">
            <span className="review__k">Description</span>
            <p>{vision.find((r) => r.fieldId === 'description').value}</p>
          </div>
        )}
      </ReviewSection>

      <ReviewSection title="Uploaded images" step={2} onEdit={onEdit}>
        {images.length ? (
          <ul role="list" className="review__imgs">
            {images.map((f) => (
              <li key={f.id}>
                {getPreview(f.id) ? <img src={getPreview(f.id)} alt={f.name} /> : <span className="review__noimg">{f.name}</span>}
              </li>
            ))}
          </ul>
        ) : <p className="review__empty">No images added.</p>}
      </ReviewSection>

      <ReviewSection title="Selections" step={3} onEdit={onEdit}>
        {details.map((d) => (
          <div key={d.category} className="review__group">
            <h4>{getCategory(d.category)?.name}</h4>
            {d.rows.length ? <Rows rows={d.rows} /> : <p className="review__empty">No specific selections — Jessica will ask.</p>}
          </div>
        ))}
        <div className="review__group">
          <h4>Whole request</h4>
          <Rows rows={common} />
        </div>
      </ReviewSection>

      <ReviewSection title="Budget & timeline" step={4} onEdit={onEdit}>
        <Rows rows={budget} empty="Not specified" />
      </ReviewSection>

      <ReviewSection title="Contact information" step={5} onEdit={onEdit}>
        <Rows rows={contact.filter((r) => r.fieldId !== 'agree')} />
      </ReviewSection>
    </div>
  );
}

function ReviewSection({ title, step, onEdit, children }) {
  return (
    <section className="review__section">
      <div className="review__head">
        <h3>{title}</h3>
        <button type="button" className="review__edit" onClick={() => onEdit(step)}>
          Edit<span className="visually-hidden"> {title.toLowerCase()}</span>
        </button>
      </div>
      {children}
    </section>
  );
}

function Rows({ rows, empty = 'Nothing added' }) {
  if (!rows.length) return <p className="review__empty">{empty}</p>;
  return (
    <dl className="review__rows">
      {rows.map((r) => (
        <div key={r.fieldId}>
          <dt>{r.label}</dt>
          <dd>
            {r.hexes && (
              <span className="review__dots" aria-hidden="true">
                {r.hexes.map((h, i) => <span key={i} style={{ background: h || 'conic-gradient(#F4A7C0,#C9B6E4,#4FCDBB,#D4AF37,#F4A7C0)' }} />)}
              </span>
            )}
            {r.hex && <span className="review__dots" aria-hidden="true"><span style={{ background: r.hex }} /></span>}
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
