/* UI icons — 24px line icons, currentColor */
const Svg = ({ children, size = 22, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
    {children}
  </svg>
);

export const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Svg>;
export const UserIcon = (p) => <Svg {...p}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" /></Svg>;
export const HeartIcon = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </Svg>
);
export const BagIcon = (p) => <Svg {...p}><path d="M5.5 8h13l-1 12h-11z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></Svg>;
export const MenuIcon = (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const PlusIcon = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const MinusIcon = (p) => <Svg {...p}><path d="M5 12h14" /></Svg>;
export const TrashIcon = (p) => <Svg {...p}><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" /></Svg>;
export const CameraIcon = (p) => <Svg {...p}><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.3" /></Svg>;
export const DiamondIcon = (p) => <Svg {...p}><path d="M7 4h10l4 5-9 11L3 9z" /><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" /></Svg>;
export const GiftIcon = (p) => <Svg {...p}><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" /><path d="M12 7c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1Z" /></Svg>;
export const QuoteIcon = (p) => <Svg {...p}><path d="M9 7c-3 1-4.5 3.4-4.5 6.5V17H9v-4H6.8M19 7c-3 1-4.5 3.4-4.5 6.5V17H19v-4h-2.2" /></Svg>;

/** Four-point sparkle, filled. Decorative only. */
export function Sparkle({ size = 14, className = '', style }) {
  return (
    <svg className={`sparkle ${className}`} style={style} width={size} height={size} viewBox="0 0 20 20"
      aria-hidden="true" focusable="false">
      <path d="M10 0c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10C5.2 9.4 9.4 5.2 10 0Z" fill="currentColor" />
    </svg>
  );
}

export function ValueIcon({ name, ...p }) {
  if (name === 'diamond') return <DiamondIcon {...p} />;
  if (name === 'heart') return <HeartIcon {...p} />;
  if (name === 'gift') return <GiftIcon {...p} />;
  return <Svg {...p}><path d="M12 3c.4 4.4 2.6 6.6 7 7-4.4.4-6.6 2.6-7 7-.4-4.4-2.6-6.6-7-7 4.4-.4 6.6-2.6 7-7Z" /><path d="M19 16v4M17 18h4" /></Svg>;
}
