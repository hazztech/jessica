import { useEffect, useState } from 'react';
import { useRouter } from '../lib/router.jsx';
import { getOrder } from '../services/orders.js';
import { formatPrice } from '../lib/format.js';
import { CrystalHeart } from '../components/Ornament.jsx';
import Button from '../components/Button.jsx';
import './CheckoutPage.css';

export default function OrderConfirmation() {
  const { query } = useRouter();
  const [order, setOrder] = useState(undefined);
  useEffect(() => { getOrder(query.get('order')).then(setOrder); }, [query]);
  if (order === undefined) return <div className="page-loading" aria-busy="true" />;

  return (
    <section className="ck ck--done">
      <div className="container ck__col">
        <div className="ck__done">
          <span className="ck__done-heart"><CrystalHeart size={38} /></span>
          <h1>Thank you{order ? `, ${order.customer.name.split(' ')[0]}` : ''}!</h1>
          {order ? (
            <>
              <p className="ck__done-num">Order <strong>{order.orderNumber}</strong></p>
              <p>We’ve received your order{order.preview ? ' (preview — no payment was taken)' : ''}. A confirmation will be sent to <strong>{order.customer.email}</strong>.</p>
              <ul role="list" className="ck__done-items">
                {order.items.map((i, n) => (
                  <li key={n}><span>{i.quantity} × {i.name}</span><span>{formatPrice(i.unitPrice * i.quantity)}</span></li>
                ))}
                <li className="ck__grand"><span>Total</span><span>{formatPrice(order.total)}</span></li>
              </ul>
              <p className="cz-help">Jessica starts on your pieces right away. You’ll hear from her if any design detail needs a quick check.</p>
            </>
          ) : <p>We couldn’t find that order. If you just placed it, check your email for the confirmation.</p>}
          <Button to="/shop" full>Continue Shopping</Button>
        </div>
      </div>
    </section>
  );
}
