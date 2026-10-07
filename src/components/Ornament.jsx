import './Ornament.css';

/** Silver divider with a small crystal heart — the site's quiet signature detail. */
export default function Ornament({ className = '' }) {
  return (
    <span className={`ornament ${className}`} aria-hidden="true">
      <span className="ornament__line" />
      <CrystalHeart size={16} />
      <span className="ornament__line" />
    </span>
  );
}

export function CrystalHeart({ size = 18, className = '' }) {
  return (
    <svg className={`crystal-heart ${className}`} width={size} height={size} viewBox="0 0 24 22" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ch-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2FCFA" />
          <stop offset=".5" stopColor="#A9E9DE" />
          <stop offset="1" stopColor="#4FCDBB" />
        </linearGradient>
      </defs>
      <path d="M12 20.5C10 18.8 1.5 13.3 1.5 7.2 1.5 4 4 1.5 7 1.5c2.2 0 4 1.2 5 3 1-1.8 2.8-3 5-3 3 0 5.5 2.5 5.5 5.7 0 6.1-8.5 11.6-10.5 13.3Z"
        fill="url(#ch-fill)" stroke="#AEB4BA" strokeWidth="1.2" />
      <path d="M12 4.5 9 9l3 11.5L15 9Z M1.8 7.5H22.2" fill="none" stroke="#fff" strokeWidth=".9" opacity=".85" />
    </svg>
  );
}
