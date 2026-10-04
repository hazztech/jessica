import { CloseIcon, Sparkle } from './icons.jsx';
import './Toast.css';

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <Sparkle size={14} className="toast__spark" />
          <span className="toast__msg">{t.message}</span>
          {t.action && (
            <button type="button" className="toast__action" onClick={() => { t.action.onClick(); onDismiss(t.id); }}>
              {t.action.label}
            </button>
          )}
          <button type="button" className="toast__close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            <CloseIcon size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
