/**
 * Progress indicator for multi-step forms.
 * Completed steps are buttons so customers can jump back; future steps are not.
 */
export default function FormStepper({ steps, current, furthest, onSelect }) {
  const pct = Math.round(((Math.min(current, steps.length - 1) + 1) / steps.length) * 100);
  const onReview = current >= steps.length;
  return (
    <nav className="stepper" aria-label="Request progress">
      <p className="stepper__mobile">
        {onReview ? 'Review your request' : <>Step {current + 1} of {steps.length} <span aria-hidden="true">·</span> {steps[current].title}</>}
      </p>
      <div className="stepper__bar" aria-hidden="true"><span style={{ width: onReview ? '100%' : `${pct}%` }} /></div>
      <ol role="list" className="stepper__list">
        {steps.map((s, i) => {
          const state = i === current ? 'current' : i < furthest || onReview ? 'done' : 'todo';
          const reachable = i <= furthest && i !== current;
          const inner = (
            <>
              <span className="stepper__num" aria-hidden="true">{state === 'done' ? '✓' : i + 1}</span>
              <span className="stepper__title">{s.title}</span>
            </>
          );
          return (
            <li key={s.id} className={`stepper__item is-${state}`}>
              {reachable ? (
                <button type="button" className="stepper__btn" onClick={() => onSelect(i)}>
                  {inner}<span className="visually-hidden"> (completed, edit)</span>
                </button>
              ) : (
                <span className="stepper__btn" aria-current={state === 'current' ? 'step' : undefined}>{inner}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
