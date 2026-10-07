import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { getProductBySlug } from '../data/products.js';
import { getCategory } from '../data/categories.js';
import {
  applyChange, buildCartLine, computePrice, defaultValues, resolveSchema, validate,
} from '../lib/customization.js';
import { formatPrice } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductGallery from '../components/ProductGallery.jsx';
import CustomizationForm from '../components/CustomizationForm.jsx';
import PriceSummary from '../components/PriceSummary.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import Button from '../components/Button.jsx';
import ComingSoon from './ComingSoon.jsx';
import './ProductPage.css';

export default function ProductPage({ slug }) {
  const product = getProductBySlug(slug);
  if (!product || !product.active) {
    return (
      <ComingSoon title="We couldn’t find that product" accent="oh no">
        It may have sold out or moved. Try the shop, or ask Jessica to make it for you.
      </ComingSoon>
    );
  }
  return <ProductDetail product={product} />;
}

function ProductDetail({ product }) {
  const { query, navigate } = useRouter();
  const cart = useCart();
  const toast = useToast();
  const category = getCategory(product.category);

  const fields = useMemo(() => resolveSchema(product), [product]);
  const editId = query.get('edit');
  const editing = editId ? cart.getLine(editId) : null;
  const isEdit = !!editing && editing.productId === product.id;

  const [values, setValues] = useState(() =>
    isEdit ? { ...defaultValues(fields), ...editing.selections } : defaultValues(fields)
  );
  const [quantity, setQuantity] = useState(isEdit ? editing.quantity : 1);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);

  const price = computePrice(product, fields, values, quantity);
  const errorCount = Object.keys(errors).length;

  // Sticky "Add To Cart" (phones): only once every required option is chosen,
  // and only while the in-page button is scrolled out of view.
  const requiredDone = useMemo(() => Object.keys(validate(fields, values)).length === 0, [fields, values]);
  const buyRef = useRef(null);
  const [buyVisible, setBuyVisible] = useState(true);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => setBuyVisible(entry.isIntersecting), { rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const showSticky = requiredDone && !buyVisible;

  useEffect(() => {
    if (query.get('customize') || isEdit) {
      document.getElementById('customize')?.scrollIntoView({ block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (id, value) => {
    const next = applyChange(fields, values, id, value);
    setValues(next);
    if (attempted) setErrors(validate(fields, next));
  };

  const submit = (e) => {
    e?.preventDefault();
    setAttempted(true);
    const errs = validate(fields, values);
    setErrors(errs);
    const first = fields.find((f) => errs[f.id]);
    if (first) {
      const el = document.getElementById(`field-${first.id}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
      return;
    }
    const line = buildCartLine(product, fields, values, quantity);
    if (isEdit) {
      cart.updateLine(editing.lineId, line);
      toast('Your changes were saved');
      navigate(`/product/${product.slug}`, { replace: true });
      cart.openCart();
    } else {
      cart.addItem(line);
      toast(`${product.name} added to your cart`, { action: { label: 'View cart', onClick: cart.openCart } });
    }
  };

  const actionLabel = isEdit ? 'Update Item' : 'Add To Cart';

  return (
    <div className="pdp">
      <div className="container">
        <nav className="pdp__crumbs" aria-label="Breadcrumb">
          <ol role="list">
            <li><Link to="/shop">Shop</Link></li>
            {category && <li><Link to={`/shop?category=${category.slug}`}>{category.name}</Link></li>}
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="pdp__grid">
          <div className="pdp__media"><ProductGallery product={product} /></div>

          <div className="pdp__info">
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__reviews">
              <span className="pdp__stars" aria-hidden="true">☆☆☆☆☆</span>
              <span>No reviews yet</span>
            </p>
            <p className="pdp__price">
              <span className="pdp__price-now">{formatPrice(price.unit)}</span>
              {product.salePrice != null && product.salePrice < product.price && (
                <s className="pdp__price-was">{formatPrice(product.price + price.addOns)}</s>
              )}
              {price.addOns > 0 && <span className="pdp__price-note">includes {formatPrice(price.addOns)} in options</span>}
            </p>
            <p className="pdp__desc">{product.description}</p>
            <p className="pdp__eta">
              <span className="pdp__eta-label">Estimated production time</span>
              <span>{product.estimatedProductionTime}</span>
            </p>

            <form id="customize" className="pdp__form" onSubmit={submit} noValidate>
              {isEdit && <p className="pdp__editing">You’re editing an item in your cart.</p>}

              {fields.length > 0 && (
                <>
                  <h2 className="pdp__form-title">{isEdit ? 'Edit your design' : 'Customize yours'}</h2>
                  <CustomizationForm fields={fields} values={values} errors={errors} onChange={onChange} />
                </>
              )}

              <div className="pdp__buy" ref={buyRef}>
                <div className="pdp__qty">
                  <span className="cz-label" id="qty-label">Quantity</span>
                  <QuantityStepper value={quantity} onChange={setQuantity} />
                </div>
                <PriceSummary price={price} />
                {errorCount > 0 && (
                  <p className="cz-error pdp__errsum" role="alert">
                    Please complete {errorCount === 1 ? '1 field' : `${errorCount} fields`} marked above.
                  </p>
                )}
                <Button type="submit" size="lg" full>{actionLabel} · {formatPrice(price.total)}</Button>
                {isEdit && (
                  <Button variant="ghost" full onClick={() => navigate(`/product/${product.slug}`, { replace: true })}>
                    Cancel editing
                  </Button>
                )}
              </div>
            </form>

            <aside className="pdp__custom">
              <p>Dreaming of something different?</p>
              <Link to="/custom-orders">Request a fully custom piece</Link>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile: sticky add-to-cart once required options are chosen */}
      <div className={`pdp__sticky ${showSticky ? 'is-shown' : ''}`} aria-hidden={!showSticky} inert={!showSticky ? true : undefined}>
        <div className="pdp__sticky-price">
          <span>Total</span>
          <strong>{formatPrice(price.total)}</strong>
        </div>
        <Button size="lg" onClick={submit}>{actionLabel}</Button>
      </div>
    </div>
  );
}
