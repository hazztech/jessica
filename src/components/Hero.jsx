import Button from './Button.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import { Link } from '../lib/router.jsx';
import { Sparkle } from './icons.jsx';
import './Hero.css';

/* Display-case order: three shelves, every category given equal standing */
const shelf = [
  ['hats', 'Hats'], ['ties', 'Ties'], ['tumblers', 'Tumblers'],
  ['outfits', 'Outfits'], ['shoes', 'Shoes'], ['shirts', 'Shirts'],
  ['socks', 'Socks'], ['jackets', 'Jackets'],
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            <span className="hero__title-serif">Wear Your</span>
            <span className="hero__title-script script">Imagination</span>
          </h1>
          <p className="hero__lead">Custom shoes, apparel and accessories made just for you.</p>
          <p className="hero__sub">
            From statement shoes to personalized apparel and accessories, every creation is designed
            to reflect your unique style.
          </p>
          <div className="hero__ctas">
            <Button to="/shop" size="lg">SHOP NOW</Button>
            <Button to="/custom-orders" size="lg" variant="secondary">CUSTOM ORDERS</Button>
          </div>
        </div>

        <div className="hero__case">
          <div className="case">
            <div className="case__interior">
              <ul role="list" className="case__shelves" aria-label="Shop by collection">
                {shelf.map(([id, label], i) => (
                  <li key={id} className="case__item" style={{ '--i': i }}>
                    <Link to={`/shop?category=${id}`} className="case__link">
                      <span className="case__pedestal"><CategoryIcon category={id} /></span>
                      <span className="case__label">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Silver arch with set rhinestones, heart crown and mint ribbon */}
            <svg className="case__frame" viewBox="0 0 400 520" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F5F6F7" />
                  <stop offset=".45" stopColor="#C9CDD1" />
                  <stop offset=".7" stopColor="#EFF1F2" />
                  <stop offset="1" stopColor="#AEB3B8" />
                </linearGradient>
                <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#4FCDBB" />
                  <stop offset=".5" stopColor="#7FE0D1" />
                  <stop offset="1" stopColor="#07877C" />
                </linearGradient>
              </defs>
              <path d="M18 520V198a182 182 0 0 1 364 0v322" fill="none" stroke="url(#silver)" strokeWidth="5" />
              <path d="M34 520V198a166 166 0 0 1 332 0v322" fill="none" stroke="url(#silver)" strokeWidth="2" />
              {/* rhinestones: dotted path, silver setting + white stone */}
              <path d="M26 512V198a174 174 0 0 1 348 0v314" fill="none" stroke="#B8BDC2" strokeWidth="7.5"
                strokeLinecap="round" strokeDasharray="0 13" />
              <path d="M26 512V198a174 174 0 0 1 348 0v314" fill="none" stroke="#FFFFFF" strokeWidth="4.5"
                strokeLinecap="round" strokeDasharray="0 13" />
              {/* ribbon tails sweeping from the crown */}
              <path className="case__ribbon" d="M200 40c-40 6-70 30-104 26-26-3-40-20-58-14" fill="none"
                stroke="url(#ribbon)" strokeWidth="9" strokeLinecap="round" />
              <path className="case__ribbon" d="M200 40c40 6 70 30 104 26 26-3 40-20 58-14" fill="none"
                stroke="url(#ribbon)" strokeWidth="9" strokeLinecap="round" />
              {/* heart crown */}
              <path d="M200 64c-3-4-26-17-26-33 0-9 7-15 14-15 6 0 10 3 12 8 2-5 6-8 12-8 7 0 14 6 14 15 0 16-23 29-26 33Z"
                fill="#FFFFFF" stroke="url(#silver)" strokeWidth="3" />
              <path d="M200 54c-2-3-16-11-16-21 0-5 4-9 8-9 4 0 7 2 8 5 1-3 4-5 8-5 4 0 8 4 8 9 0 10-14 18-16 21Z"
                fill="#DDF8F3" stroke="#4FCDBB" strokeWidth="1.5" />
            </svg>

            <Sparkle className="case__spark case__spark--1" size={22} />
            <Sparkle className="case__spark case__spark--2" size={14} />
            <Sparkle className="case__spark case__spark--3" size={18} />
            <span className="case__plinth" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
