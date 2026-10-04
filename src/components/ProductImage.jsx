import CategoryIcon from './CategoryIcon.jsx';
import { Sparkle } from './icons.jsx';
import './ProductImage.css';

/**
 * Shows the real photo when one exists; otherwise on-brand placeholder art.
 * Real photos: pass { url, alt, width, height }. Lazy-loaded by default.
 */
export default function ProductImage({ image, category, alt = '', eager = false, shape = 'square' }) {
  if (image?.url) {
    return (
      <img className={`pimg pimg--${shape}`} src={image.url} alt={image.alt ?? alt}
        width={image.width} height={image.height}
        loading={eager ? 'eager' : 'lazy'} decoding="async" />
    );
  }
  return (
    <div className={`pimg pimg--${shape} pimg--placeholder`} role="img" aria-label={alt || undefined}>
      <span className="pimg__halo" />
      <CategoryIcon category={category} className="pimg__icon" />
      <Sparkle className="pimg__spark pimg__spark--a" size={12} />
      <Sparkle className="pimg__spark pimg__spark--b" size={8} />
    </div>
  );
}
