import { testimonials } from '../data/site.js';
import { QuoteIcon } from './icons.jsx';
import './Testimonials.css';

export default function Testimonials({ items = testimonials }) {
  return (
    <section className="section testimonials" aria-labelledby="t-title">
      <div className="container">
        <header className="section-head">
          <span className="script section-head__accent" aria-hidden="true">kind words</span>
          <h2 id="t-title">Loved by Our Customers</h2>
        </header>
        <ul role="list" className="testimonials__list">
          {items.map((t, i) => (
            <li key={i}>
              <figure className="quote">
                <QuoteIcon className="quote__mark" size={28} />
                <blockquote><p>{t.quote}</p></blockquote>
                <figcaption><strong>{t.name}</strong><span>{t.detail}</span></figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
