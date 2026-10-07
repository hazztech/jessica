import { Link } from '../lib/router.jsx';
import Logo from './Logo.jsx';
import Ornament from './Ornament.jsx';
import { categories } from '../data/categories.js';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer__orn"><Ornament /></div>
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo size="footer" />
          <p>Custom shoes, apparel, gifts and accessories — designed and handcrafted for you.</p>
        </div>
        <nav aria-label="Shop collections">
          <h2 className="site-footer__h">Shop</h2>
          <ul role="list">
            {categories.map((c) => (
              <li key={c.id}><Link to={`/shop?category=${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Help">
          <h2 className="site-footer__h">Help</h2>
          <ul role="list">
            <li><Link to="/custom-orders">Custom orders</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/account">Track an order</Link></li>
          </ul>
        </nav>
        <nav aria-label="About">
          <h2 className="site-footer__h">Jessica’s</h2>
          <ul role="list">
            <li><Link to="/about">About Jessica</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/contact">Wholesale &amp; events</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container site-footer__base">
        <p>© {year} Jessica’s Customized Shoes &amp; Accessories. All rights reserved.</p>
      </div>
    </footer>
  );
}
