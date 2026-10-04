import { NavLink } from '../lib/router.jsx';
import { navLinks } from '../data/site.js';

export default function Navigation({ className = '', onNavigate, vertical = false }) {
  return (
    <nav className={className} aria-label="Main">
      <ul role="list" className={vertical ? 'nav-list nav-list--vertical' : 'nav-list'}>
        {navLinks.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} className="nav-link" onClick={onNavigate}>{l.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
