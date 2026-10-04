import { howItWorks } from '../data/site.js';
import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="section how" aria-labelledby="how-title">
      <div className="container">
        <header className="section-head">
          <span className="script section-head__accent" aria-hidden="true">simply made</span>
          <h2 id="how-title">How It Works</h2>
        </header>
        <ol role="list" className="how__steps">
          {howItWorks.map((s, i) => (
            <li key={s.title} className="how__step">
              <span className="how__num" aria-hidden="true">{i + 1}</span>
              <h3>
                <span className="visually-hidden">Step {i + 1}: </span>
                {s.title}
              </h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
