import Button from './Button.jsx';
import { Sparkle } from './icons.jsx';
import './CustomOrderCallout.css';

export default function CustomOrderCallout() {
  return (
    <section className="callout" aria-labelledby="callout-title">
      <div className="container">
        <div className="callout__panel">
          <span className="callout__ribbon" aria-hidden="true" />
          <Sparkle className="callout__spark callout__spark--a" size={20} />
          <Sparkle className="callout__spark callout__spark--b" size={12} />
          <div className="callout__content">
            <span className="script callout__accent" aria-hidden="true">your vision</span>
            <h2 id="callout-title">Have a Custom Request?</h2>
            <p>
              Let’s bring your vision to life. From special events to one-of-a-kind designs, Jessica
              creates pieces made specifically for you.
            </p>
            <Button to="/custom-orders" variant="light" size="lg">SUBMIT A CUSTOM ORDER</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
