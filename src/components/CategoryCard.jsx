import { Link } from '../lib/router.jsx';
import ProductImage from './ProductImage.jsx';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  const to = `/shop?category=${category.slug}`;
  return (
    <article className="ccard">
      <Link to={to} className="ccard__media" tabIndex={-1} aria-hidden="true">
        <ProductImage image={category.image} category={category.id} shape="portrait" />
      </Link>
      <div className="ccard__body">
        <h3 className="ccard__name">{category.name}</h3>
        <p className="ccard__desc">{category.description}</p>
        <Link to={to} className="ccard__cta" aria-label={`Shop ${category.name}`}>SHOP NOW</Link>
      </div>
    </article>
  );
}
