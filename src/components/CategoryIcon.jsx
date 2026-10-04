/**
 * Line illustrations for each category (48px grid).
 * Used as placeholder art until real product photography is uploaded.
 */
const paths = {
  shoes: (
    <>
      <path d="M5 31c0-4 1.6-8 5.5-8.6l7-.6 5.8-6.3c1.7-1.8 4.2-1.6 5.6.3l3.6 5c3.3 2.2 9.5 3 10.5 6.6V35H5Z" />
      <path d="M5 35h38M21 20.5l3 3M24.5 17.5l3 3M28 15.5l2.6 3.6" />
      <path d="M12 28.5h8" className="ci-accent" />
    </>
  ),
  outfits: (
    <>
      <path d="M19 6h10l-1.5 9.5H20.5Z" />
      <path d="M20.5 15.5h7c4 6 7.5 14 11 22.5-4 2-24 2-29 0 3.5-8.5 7-16.5 11-22.5Z" />
      <path d="M14 30c3 1.2 6.5 1 10 0s7-1.2 10 0" className="ci-accent" />
    </>
  ),
  shirts: (
    <>
      <path d="M17 8 9.5 12 5 20.5l6 3 2.5-4V41h21V19.5l2.5 4 6-3L38.5 12 31 8c-1.6 3.2-12.4 3.2-14 0Z" />
      <path d="M19.5 25h9M21 29.5h6" className="ci-accent" />
    </>
  ),
  ties: (
    <>
      <path d="M19.5 5h9l-2.2 7h-4.6Z" />
      <path d="M21.7 12 18.5 34l5.5 9 5.5-9-3.2-22" />
      <circle cx="24" cy="22" r="1.1" className="ci-accent ci-fill" />
      <circle cx="23.4" cy="28" r="1.1" className="ci-accent ci-fill" />
      <circle cx="24" cy="34" r="1.1" className="ci-accent ci-fill" />
    </>
  ),
  tumblers: (
    <>
      <path d="M13 9h22v4H13Z" />
      <path d="M14.5 13h19l-2.6 29H17.1Z" />
      <path d="M28 9l3.5-6.5" />
      <path d="M18 22h12M18.8 30h10.4" className="ci-accent" />
    </>
  ),
  socks: (
    <>
      <path d="M17 4h13v20.5l7.7 7.8c3.2 3.2 1 9.7-4.6 9.7-2.4 0-4-.8-5.6-2.4L17 29.1Z" />
      <path d="M17 10h13" />
      <path d="M17 17h13" className="ci-accent" />
    </>
  ),
  hats: (
    <>
      <path d="M7 31c0-11.5 7.5-18 17-18s16 6.5 16 15v3Z" />
      <path d="M40 28.5c3 .2 5 1.6 5 3.5H7v-1" />
      <path d="M24 13V9.5" />
      <path d="M17 21.5c2-2 4.4-3 7-3" className="ci-accent" />
    </>
  ),
  jackets: (
    <>
      <path d="M17.5 6 10 10 6 40l12 2 1.5-20L24 14l4.5 8 1.5 20 12-2-4-30-7.5-4L24 14Z" />
      <path d="M24 14v28" />
      <path d="M12 26h4M32 26h4" className="ci-accent" />
    </>
  ),
};

export default function CategoryIcon({ category, size = 48, className = '' }) {
  return (
    <svg className={`category-icon ${className}`} width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {paths[category] || paths.shoes}
    </svg>
  );
}
