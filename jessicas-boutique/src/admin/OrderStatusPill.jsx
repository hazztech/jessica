import { orderStatusLabel } from '../services/orders.js';

export default function OrderStatusPill({ status }) {
  return <span className={`status ostatus--${status}`}>{orderStatusLabel(status)}</span>;
}
