import { Link } from '../lib/router.jsx';

/**
 * The OFFICIAL approved logo — used as supplied.
 * Files in /public/brand are the original logo, only resized for performance.
 * Do not redraw, recolor, crop or replace it.
 */
export default function Logo({ size = 'header', linked = true, className = '' }) {
  const img = (
    <img
      className={`logo logo--${size} ${className}`}
      src="/brand/logo-240.webp"
      srcSet="/brand/logo-240.webp 240w, /brand/logo-480.webp 480w, /brand/logo-960.webp 960w"
      sizes={size === 'footer' ? '200px' : '(min-width: 960px) 124px, 96px'}
      width="1448"
      height="1086"
      alt="Jessica’s Customized Shoes & Accessories"
      decoding="async"
    />
  );
  if (!linked) return img;
  return (
    <Link to="/" className="logo-link" aria-label="Jessica’s Customized Shoes & Accessories — home">
      {img}
    </Link>
  );
}
