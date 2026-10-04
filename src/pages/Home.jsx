import Hero from '../components/Hero.jsx';
import ValueStrip from '../components/ValueStrip.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import CustomOrderCallout from '../components/CustomOrderCallout.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Button from '../components/Button.jsx';
import { categories } from '../data/categories.js';
import { featuredProducts } from '../data/products.js';
import './Home.css';

export default function Home() {
  const featured = featuredProducts();
  return (
    <>
      <Hero />
      <ValueStrip />

      <section className="section" aria-labelledby="collections-title">
        <div className="container">
          <header className="section-head">
            <span className="script section-head__accent" aria-hidden="true">made for you</span>
            <h2 id="collections-title">Shop Our Collections</h2>
            <p>Eight ways to wear your style — every piece can be made your own.</p>
          </header>
          <ul role="list" className="home-grid home-grid--categories">
            {categories.map((c) => <li key={c.id}><CategoryCard category={c} /></li>)}
          </ul>
        </div>
      </section>

      <section className="section home-featured" aria-labelledby="featured-title">
        <div className="container">
          <header className="section-head">
            <span className="script section-head__accent" aria-hidden="true">customer favorites</span>
            <h2 id="featured-title">Featured Products</h2>
          </header>
          <ul role="list" className="home-grid home-grid--products">
            {featured.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
          </ul>
          <div className="home-featured__more">
            <Button to="/shop" variant="secondary">View all products</Button>
          </div>
        </div>
      </section>

      <CustomOrderCallout />
      <HowItWorks />
      <Testimonials />
    </>
  );
}
