import Button from '../components/Button.jsx';
import './ComingSoon.css';

/** Temporary page for routes scheduled in later build phases. */
export default function ComingSoon({ title, accent, children }) {
  return (
    <section className="section soon">
      <div className="container soon__inner">
        {accent && <span className="script soon__accent" aria-hidden="true">{accent}</span>}
        <h1>{title}</h1>
        <p>{children || 'This page is being designed now and will open soon.'}</p>
        <hr className="stone-rule" />
        <div className="soon__ctas">
          <Button to="/shop">Shop now</Button>
          <Button to="/custom-orders" variant="secondary">Start a custom order</Button>
        </div>
      </div>
    </section>
  );
}
