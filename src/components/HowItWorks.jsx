import { howItWorks } from '../data/site.js';
import SectionHead from './SectionHead.jsx';
import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="section how" aria-labelledby="how-title">
      <div className="container">
        <SectionHead id="how-title" title="How It Works" />
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
