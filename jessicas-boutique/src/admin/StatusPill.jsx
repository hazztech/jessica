import { statusLabel } from '../services/customRequests.js';

export default function StatusPill({ status }) {
  return <span className={`status status--${status}`}>{statusLabel(status)}</span>;
}
