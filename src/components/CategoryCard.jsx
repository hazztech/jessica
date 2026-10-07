import { Link } from '../lib/router.jsx';
import ProductImage from './ProductImage.jsx';
import './CategoryCard.css';

export default function CategoryCard({ category }) {
  const to = `/shop?category=${category.slug}`;
  return (
    <Link to={to} className="ccard" aria-label={`Shop ${category.name}`}>
      <span className="ccard__media">
        <ProductImage image={category.image} category={category.id} shape="portrait" />
      </span>
      <span className="ccard__body">
        <span className="ccard__name">{category.name}</span>
        <span className="ccard__desc">{category.description}</span>
        <span className="ccard__cta">Shop Now</span>
      </span>
    </Link>
  );
}
