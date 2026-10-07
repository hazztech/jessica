import Button from './Button.jsx';
import ProductArt from './ProductArt.jsx';
import { CrystalHeart } from './Ornament.jsx';
import { Sparkle } from './icons.jsx';
import { heroPhotos } from '../data/site.js';
import { Link } from '../lib/router.jsx';
import './Hero.css';

/*
 * Flat-lay of every category — no single product dominates.
 * Positions are % of the frame: [category, left, top, width, rotation]
 */
const flatLay = [
  ['jackets', 31, 5, 38, 0],
  ['hats', 4, 25, 33, -10],
  ['ties', 68, 21, 26, 14],
  ['shirts', 2, 47, 35, -5],
  ['outfits', 31, 35, 38, 0],
  ['tumblers', 67, 44, 29, 5],
  ['shoes', 22, 60, 52, -4],
  ['socks', 70, 65, 27, 10],
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
          <div className="hero__ctas">
            <Button to="/shop" size="lg">Shop Now</Button>
            <Button to="/custom-orders" size="lg" variant="secondary">Custom Orders</Button>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__frame">
            {heroPhotos ? (
              <img className="hero__photo" src={heroPhotos.main.url} srcSet={heroPhotos.main.srcSet}
                sizes="(min-width: 900px) 520px, (min-width: 720px) 50vw, 340px"
                alt={heroPhotos.main.alt} width={heroPhotos.main.width} height={heroPhotos.main.height}
                fetchpriority="high" decoding="async" />
            ) : (
              <div className="hero__flatlay" role="img"
                aria-label="Custom shoes, outfits, shirts, ties, tumblers, socks, hats and jackets">
                <svg className="hero__ribbon" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="hero-ribbon" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#DDF8F3" />
                      <stop offset=".5" stopColor="#9FE3D8" />
                      <stop offset="1" stopColor="#DDF8F3" />
                    </linearGradient>
                  </defs>
                  <path d="M-20 300C60 240 120 380 210 330S330 210 420 260" fill="none"
                    stroke="url(#hero-ribbon)" strokeWidth="16" strokeLinecap="round" opacity=".8" />
                </svg>
                {flatLay.map(([cat, left, top, width, rot]) => (
                  <span key={cat} className="hero__item"
                    style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, '--rot': `${rot}deg` }}>
                    <ProductArt category={cat} shadow={false} />
                  </span>
                ))}
              </div>
            )}
          </div>
          {heroPhotos?.accents?.map((a, i) => (
            <Link key={a.label} to={a.to} className={`hero__accent hero__accent--${i + 1}`} aria-label={`Shop ${a.label}`}>
              <img src={a.image.url} srcSet={a.image.srcSet} sizes="180px" alt="" width={a.image.width} height={a.image.height}
                loading="eager" decoding="async" />
              <span className="hero__accent-label">{a.label}</span>
            </Link>
          ))}
          <span className="hero__crown"><CrystalHeart size={30} /></span>
          <Sparkle className="hero__spark hero__spark--a" size={16} />
          <Sparkle className="hero__spark hero__spark--b" size={11} />
        </div>
      </div>
    </section>
  );
}
