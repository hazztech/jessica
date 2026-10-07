import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router.jsx';
import { categories, getCategory } from '../data/categories.js';
import { publishedGallery } from '../services/gallery.js';
import Ornament from '../components/Ornament.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import './GalleryPage.css';

export default function GalleryPage() {
  const { query, navigate } = useRouter();
  const filter = categories.some((c) => c.id === query.get('category')) ? query.get('category') : 'all';
  const [items, setItems] = useState(publishedGallery);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    const refresh = () => setItems(publishedGallery());
    window.addEventListener('jcsa:data', refresh);
    return () => window.removeEventListener('jcsa:data', refresh);
  }, []);

  const shown = items.filter((g) => filter === 'all' || g.category === filter);
  const open = openIndex >= 0 ? shown[openIndex] : null;
  const step = (d) => setOpenIndex((i) => (i + d + shown.length) % shown.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = (id) => navigate(id === 'all' ? '/gallery' : `/gallery?category=${id}`, { replace: true, scroll: false });
  const count = (id) => items.filter((g) => g.category === id).length;
  const cat = filter !== 'all' ? getCategory(filter) : null;

  return (
    <div className="gal">
      <header className="gal__head">
        <div className="container">
          <h1>Gallery</h1>
          <Ornament />
          <p>A look at pieces Jessica has made for customers. See something you love? She can create something similar, just for you.</p>
        </div>
      </header>

      <div className="gal__filters">
        <div className="container">
          <nav className="gal__chips" aria-label="Filter gallery by category">
            {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
              <button key={c.id} type="button" className={`gal__chip ${filter === c.id ? 'is-on' : ''}`}
                aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
                {c.name}{c.id !== 'all' && <span>{count(c.id)}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container gal__body">
        {shown.length ? (
          <ul role="list" className="gal__grid">
            {shown.map((g, i) => (
              <li key={g.id} className="gal__item">
                <button type="button" className="gal__tile" onClick={() => setOpenIndex(i)}
                  aria-label={`View ${g.title}`}>
                  <img src={g.images[0].url} srcSet={g.images[0].srcSet}
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw"
                    alt={g.images[0].alt || g.title} width={g.images[0].width} height={g.images[0].height}
                    loading={i < 4 ? 'eager' : 'lazy'} decoding="async" />
                  <span className="gal__cap">
                    <strong>{g.title}</strong>
                    <span>{getCategory(g.category)?.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="gal__empty">
            <h2>{cat ? `${cat.name} coming soon` : 'Gallery coming soon'}</h2>
            <p>Jessica is photographing new pieces. In the meantime, tell her what you’re imagining.</p>
            <Button to={`/custom-orders${cat ? `?type=${cat.id}` : ''}`}>Ask Jessica To Create Something</Button>
          </div>
        )}
      </div>

      <section className="gal__cta">
        <div className="container">
          <h2>Have something in mind?</h2>
          <p>Share your idea and inspiration photos — Jessica will bring it to life.</p>
          <Button to="/custom-orders">Start a Custom Order</Button>
        </div>
      </section>

      <Modal open={!!open} onClose={() => setOpenIndex(-1)} title={open?.title || ''} className="gal__lightbox">
        {open && (
          <div className="lb">
            <div className="lb__media">
              <img src={open.images[0].url} srcSet={open.images[0].srcSet} sizes="(min-width: 900px) 640px, 100vw"
                alt={open.images[0].alt || open.title} width={open.images[0].width} height={open.images[0].height} />
              {shown.length > 1 && (
                <>
                  <button type="button" className="lb__nav lb__nav--prev" onClick={() => step(-1)} aria-label="Previous piece">‹</button>
                  <button type="button" className="lb__nav lb__nav--next" onClick={() => step(1)} aria-label="Next piece">›</button>
                </>
              )}
            </div>
            <div className="lb__info">
              <span className="lb__cat">{getCategory(open.category)?.name}</span>
              {open.description && <p>{open.description}</p>}
              <div className="lb__ctas">
                <Button full to={`/custom-orders?type=${open.category}`} onClick={() => setOpenIndex(-1)}>
                  Ask Jessica To Create Something Similar
                </Button>
                <Button full variant="secondary" to={`/shop?category=${open.category}`} onClick={() => setOpenIndex(-1)}>
                  Shop {getCategory(open.category)?.name}
                </Button>
              </div>
              <p className="lb__count" aria-live="polite">{openIndex + 1} of {shown.length}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
