import Hero from '../components/Hero.jsx';
import ValueStrip from '../components/ValueStrip.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import CustomOrderCallout from '../components/CustomOrderCallout.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Testimonials from '../components/Testimonials.jsx';
import SectionHead from '../components/SectionHead.jsx';
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
          <SectionHead id="collections-title" title="Shop Our Collections">
            Every piece can be made your own.
          </SectionHead>
          <ul role="list" className="home-grid home-grid--categories">
            {categories.map((c) => <li key={c.id}><CategoryCard category={c} /></li>)}
          </ul>
        </div>
      </section>

      <section className="section section--mint" aria-labelledby="featured-title">
        <div className="container">
          <SectionHead id="featured-title" title="Featured Products" />
          <ul role="list" className="home-grid home-grid--products">
            {featured.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
          </ul>
          <div className="home-featured__more">
            <Button to="/shop" variant="secondary">View All Products</Button>
          </div>
        </div>
      </section>

      <CustomOrderCallout />
      <HowItWorks />
      <Testimonials />
    </>
  );
}
