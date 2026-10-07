import { testimonials } from '../data/site.js';
import { QuoteIcon } from './icons.jsx';
import SectionHead from './SectionHead.jsx';
import './Testimonials.css';

export default function Testimonials({ items = testimonials }) {
  return (
    <section className="section section--mint testimonials" aria-labelledby="t-title">
      <div className="container">
        <SectionHead id="t-title" title="Loved by Our Customers" />
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
