import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';

export default function ConfirmDialog({ open, title, children, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}
      footer={
        <div className="confirm__actions">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button className={danger ? 'btn--danger' : ''} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      }>
      <div className="confirm__body">{children}</div>
    </Modal>
  );
}
