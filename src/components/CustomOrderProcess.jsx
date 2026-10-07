import { CrystalHeart } from './Ornament.jsx';

const steps = [
  { title: 'Submit Your Request', text: 'Share your idea, inspiration and timeline.' },
  { title: 'We Review & Discuss', text: 'Jessica reaches out with questions, design ideas and a quote.' },
  { title: 'Design & Create', text: 'Once you approve the quote and deposit, your piece is handcrafted.' },
  { title: 'You Shine', text: 'Your one-of-a-kind creation is ready to wear or gift.' },
];

/** "How custom orders work" sidebar. */
export default function CustomOrderProcess() {
  return (
    <aside className="process" aria-labelledby="process-title">
      <div className="process__head">
        <CrystalHeart size={22} />
        <h2 id="process-title">How custom orders work</h2>
      </div>
      <ol role="list" className="process__list">
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="process__num" aria-hidden="true">{i + 1}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="process__note">
        Most custom orders require approximately <strong>2–4 weeks</strong> depending on complexity.
        Timing is confirmed once Jessica reviews your request.
      </p>
    </aside>
  );
}
