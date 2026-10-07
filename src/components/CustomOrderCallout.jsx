import Button from './Button.jsx';
import { CrystalHeart } from './Ornament.jsx';
import { Sparkle } from './icons.jsx';
import './CustomOrderCallout.css';

export default function CustomOrderCallout() {
  return (
    <section className="callout" aria-labelledby="callout-title">
      <div className="container">
        <div className="callout__panel">
          {/* watercolor washes */}
          <span className="callout__wash callout__wash--a" aria-hidden="true" />
          <span className="callout__wash callout__wash--b" aria-hidden="true" />
          <span className="callout__wash callout__wash--c" aria-hidden="true" />

          {/* satin ribbon tied with a crystal heart */}
          <svg className="callout__ribbon" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="satin" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#BFEFE6" stopOpacity="0" />
                <stop offset=".2" stopColor="#8FDDD0" />
                <stop offset=".5" stopColor="#D5F6F0" />
                <stop offset=".8" stopColor="#8FDDD0" />
                <stop offset="1" stopColor="#BFEFE6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 70C200 30 380 100 600 56S1000 20 1200 64" fill="none" stroke="url(#satin)" strokeWidth="14" strokeLinecap="round" />
            <path d="M0 70C200 30 380 100 600 56S1000 20 1200 64" fill="none" stroke="#fff" strokeWidth="2" opacity=".7" />
          </svg>
          <span className="callout__heart"><CrystalHeart size={34} /></span>

          <Sparkle className="callout__spark callout__spark--a" size={14} />
          <Sparkle className="callout__spark callout__spark--b" size={10} />

          <div className="callout__content">
            <span className="script callout__accent" aria-hidden="true">made just for you</span>
            <h2 id="callout-title">Have A Custom Request?</h2>
            <p>
              Let’s bring your vision to life. From special events to one-of-a-kind designs, Jessica
              creates pieces made specifically for you.
            </p>
            <Button to="/custom-orders" size="lg">Submit A Custom Order</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
