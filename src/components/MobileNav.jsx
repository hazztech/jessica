import Modal from './Modal.jsx';
import Navigation from './Navigation.jsx';
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import { Link } from '../lib/router.jsx';
import { HeartIcon, UserIcon } from './icons.jsx';

export default function MobileNav({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Menu" hideTitle variant="left" className="mobile-nav">
      <div className="mobile-nav__logo"><Logo linked={false} /></div>
      <Navigation vertical onNavigate={onClose} />
      <hr className="stone-rule mobile-nav__rule" />
      <div className="mobile-nav__secondary">
        <Link to="/account" onClick={onClose}><UserIcon size={20} /> Account</Link>
        <Link to="/wishlist" onClick={onClose}><HeartIcon size={20} /> Wishlist</Link>
        <Link to="/faq" onClick={onClose}>FAQ</Link>
      </div>
      <Button to="/custom-orders" full onClick={onClose} className="mobile-nav__cta">Start a custom order</Button>
    </Modal>
  );
}
