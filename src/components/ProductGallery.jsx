import { useRef, useState } from 'react';
import ProductImage from './ProductImage.jsx';
import Modal from './Modal.jsx';
import { HeartIcon } from './icons.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Main image with hover zoom, thumbnails, optional video, lightbox and wishlist. */
export default function ProductGallery({ product }) {
  const media = [
    ...(product.images.length ? product.images.map((img) => ({ kind: 'image', img })) : [{ kind: 'image', img: null }]),
    ...(product.video ? [{ kind: 'video', src: product.video }] : []),
  ];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const wished = has(product.id);
  const current = media[active];
  const trackRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const onSwipe = () => {
    const el = trackRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  const onMove = (e) => {
    if (current.kind !== 'image' || !current.img?.url) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className={`gallery ${media.length > 1 ? 'gallery--multi' : ''}`}>
      {media.length > 1 && (
        <>
          <div className="gallery__track" ref={trackRef} onScroll={onSwipe} role="region" aria-label={`${product.name} photos, swipe for more`} tabIndex={0}>
            {media.map((m, i) => (
              <div key={i} className="gallery__slide">
                {m.kind === 'video'
                  ? <video className="gallery__video" src={m.src} controls playsInline preload="metadata" />
                  : <ProductImage image={m.img} category={product.category} alt={`${product.name}, photo ${i + 1}`} eager={i === 0} shape="portrait" sizes="100vw" />}
              </div>
            ))}
          </div>
          <div className="gallery__dots" aria-hidden="true">
            {media.map((_, i) => <span key={i} className={i === slide ? 'is-on' : ''} />)}
          </div>
        </>
      )}
      <div className="gallery__main" onMouseMove={onMove} onMouseLeave={() => setZoom(null)}>
        {current.kind === 'video' ? (
          <video className="gallery__video" src={current.src} controls playsInline preload="metadata" />
        ) : (
          <button type="button" className="gallery__zoom" onClick={() => setLightbox(true)} aria-label="Enlarge image"
            style={zoom ? { '--zx': `${zoom.x}%`, '--zy': `${zoom.y}%` } : undefined} data-zoomed={zoom ? '' : undefined}>
            <ProductImage image={current.img} category={product.category} alt={product.name} eager shape="portrait"
              sizes="(min-width: 960px) 48vw, (min-width: 600px) 560px, 100vw" />
          </button>
        )}
        <button type="button" className={`gallery__wish ${wished ? 'is-on' : ''}`} aria-pressed={wished}
          aria-label={`Save ${product.name} to wishlist`}
          onClick={() => { toggle(product.id); toast(wished ? 'Removed from your wishlist' : 'Saved to your wishlist'); }}>
          <HeartIcon filled={wished} size={20} />
        </button>
      </div>

      {media.length > 1 && (
        <ul role="list" className="gallery__thumbs">
          {media.map((m, i) => (
            <li key={i}>
              <button type="button" className={`gallery__thumb ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)} aria-label={m.kind === 'video' ? 'Play video' : `View image ${i + 1}`}
                aria-current={i === active || undefined}>
                {m.kind === 'video' ? <span className="gallery__play">▶</span> : <ProductImage image={m.img} category={product.category} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={lightbox} onClose={() => setLightbox(false)} title={product.name} className="gallery__lightbox">
        <ProductImage image={current.img} category={product.category} alt={product.name} eager shape="portrait" sizes="(min-width: 900px) 860px, 100vw" />
      </Modal>
    </div>
  );
}
