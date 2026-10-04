import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import Logo from './Logo.jsx';
import Navigation from './Navigation.jsx';
import MobileNav from './MobileNav.jsx';
import SearchModal from './SearchModal.jsx';
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './icons.jsx';
import './Header.css';

export default function Header() {
  const { count, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container site-header__inner">
        <button type="button" className="icon-btn site-header__menu" onClick={() => setMenuOpen(true)}
          aria-label="Open menu" aria-expanded={menuOpen}>
          <MenuIcon />
        </button>

        <div className="site-header__brand"><Logo /></div>

        <Navigation className="site-header__nav" />

        <div className="site-header__tools">
          <button type="button" className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
            <SearchIcon />
          </button>
          <Link to="/account" className="icon-btn hide-sm" aria-label="Account"><UserIcon /></Link>
          <Link to="/wishlist" className="icon-btn hide-sm"
            aria-label={`Wishlist${wishCount ? `, ${wishCount} saved` : ''}`}>
            <HeartIcon />
            {wishCount > 0 && <span className="count-badge count-badge--soft" aria-hidden="true">{wishCount}</span>}
          </Link>
          <button type="button" className="icon-btn" onClick={openCart}
            aria-label={`Shopping cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
            <BagIcon />
            {count > 0 && <span className="count-badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
          </button>
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
