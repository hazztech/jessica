import ProductArt from './ProductArt.jsx';
import './ProductImage.css';

/**
 * Real photo when one exists; otherwise a studio-style render on a soft backdrop.
 * Real photos: pass { url, alt, width, height }. Lazy-loaded by default.
 * Photograph products on white or pale mint with soft light so the grid stays consistent.
 */
export default function ProductImage({
  image, category, alt = '', eager = false, shape = 'square',
  sizes = '(min-width: 1280px) 22vw, (min-width: 640px) 31vw, 48vw',
}) {
  if (image?.url) {
    return (
      <img className={`pimg pimg--${shape}`} src={image.url} srcSet={image.srcSet} sizes={image.srcSet ? sizes : undefined}
        alt={image.alt ?? alt} width={image.width} height={image.height}
        loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : undefined} />
    );
  }
  return (
    <div className={`pimg pimg--${shape} pimg--studio`} role="img" aria-label={alt || undefined}>
      <ProductArt category={category} className="pimg__art" />
    </div>
  );
}
