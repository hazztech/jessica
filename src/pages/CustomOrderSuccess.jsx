import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router.jsx';
import { getSubmittedRequest } from '../services/customRequests.js';
import { getCategory } from '../data/categories.js';
import { CONTACT_METHODS } from '../data/customRequestForm.js';
import { CrystalHeart } from '../components/Ornament.jsx';
import { Sparkle } from '../components/icons.jsx';
import Button from '../components/Button.jsx';
import './CustomOrderPage.css';

export default function CustomOrderSuccess() {
  const { query } = useRouter();
  const ref = query.get('ref');
  const [request, setRequest] = useState(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    getSubmittedRequest(ref).then((r) => live && setRequest(r));
    return () => { live = false; };
  }, [ref]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (request === undefined) return <div className="page-loading" aria-busy="true" />;

  const method = CONTACT_METHODS.find((m) => m.value === request?.preferredContactMethod)?.label.toLowerCase();

  return (
    <section className="co-success">
      <div className="container">
        <div className="co-success__card">
          <span className="co-success__heart"><CrystalHeart size={40} /></span>
          <Sparkle className="co-success__spark co-success__spark--a" size={16} />
          <Sparkle className="co-success__spark co-success__spark--b" size={11} />

          <h1>Your Request Is In!</h1>

          {ref && (
            <div className="co-success__ref">
              <span>Request number</span>
              <strong>{ref}</strong>
              <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
          )}

          <p className="co-success__lead">
            Jessica will review your request and contact you regarding pricing, design details and next steps.
          </p>

          {request && (
            <p className="co-success__meta">
              {request.itemTypes.map((t) => getCategory(t)?.name).join(', ')} · We’ll reach out by {method}
              {request.preferredContactMethod === 'email' ? ` at ${request.email}` : request.phone ? ` at ${request.phone}` : ''}.
            </p>
          )}

          <ol role="list" className="co-success__next">
            <li><strong>Now</strong><span>Jessica reviews your vision and inspiration.</span></li>
            <li><strong>Next</strong><span>You’ll receive questions, ideas and a quote to approve.</span></li>
            <li><strong>Then</strong><span>After approval and deposit, your piece is made just for you.</span></li>
          </ol>

          <p className="co-success__note">Keep your request number handy — it’s the fastest way to ask about your order.</p>

          <div className="co-success__ctas">
            <Button to="/shop">Continue Shopping</Button>
            <Button to="/" variant="secondary">Back to Home</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
