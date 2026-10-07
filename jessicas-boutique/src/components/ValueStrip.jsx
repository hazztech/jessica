import { valueStatements } from '../data/site.js';
import { ValueIcon } from './icons.jsx';
import './ValueStrip.css';

export default function ValueStrip() {
  return (
    <section className="values" aria-label="Why customers choose Jessica’s">
      <div className="container"><ul role="list" className="values__list">
        {valueStatements.map((v) => (
          <li key={v.text} className="values__item">
            <span className="values__icon"><ValueIcon name={v.icon} size={18} /></span>
            <span className="values__text">{v.text}</span>
          </li>
        ))}
      </ul></div>
    </section>
  );
}
