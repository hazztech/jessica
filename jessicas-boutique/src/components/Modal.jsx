import { createPortal } from 'react-dom';
import { useDialog } from '../lib/useDialog.js';
import { CloseIcon } from './icons.jsx';
import './Modal.css';

/**
 * Accessible dialog. variant: "center" | "right" (drawer) | "left" | "top"
 */
export default function Modal({ open, onClose, title, variant = 'center', hideTitle = false, children, footer, className = '' }) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  const titleId = `modal-title-${variant}`;
  return createPortal(
    <div className={`modal modal--${variant}`}>
      <div className="modal__backdrop" onClick={onClose} />
      <div ref={ref} className={`modal__panel ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal__head">
          <h2 id={titleId} className={hideTitle ? 'visually-hidden' : 'modal__title'}>{title}</h2>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
