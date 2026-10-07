import { useId } from 'react';

/**
 * Studio-style product renders used until real photography is uploaded.
 * Soft gradients in the brand's silver / mint / teal, with a gentle floor shadow,
 * so placeholder cards read like a consistent product shoot rather than icons.
 */
const LINE = 'rgba(37,37,37,0.16)';

function Stones({ points, r = 2.1 }) {
  return points.map(([x, y], i) => (
    <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke="#AEB4BA" strokeWidth="0.8" />
  ));
}

const renders = {
  shoes: (g) => (
    <>
      <path d="M24 134h154c3 0 5 2 5 5v3c0 4-3 7-7 7H30c-4 0-7-3-7-7v-3c0-3 1-5 1-5Z" fill="#fff" stroke={LINE} strokeWidth="1.2" />
      <path d="M28 134V100c0-8 6-14 14-14h30c6 0 10 4 12 10l6 12c20 4 46 10 66 18 14 6 20 10 22 8Z" fill={`url(#${g}w)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M28 100c0-8 6-14 14-14h8v48H28Z" fill={`url(#${g}m)`} />
      <path d="M46 124c24-3 52-6 76-1l-4 9c-24-2-48-1-72 2Z" fill={`url(#${g}m)`} />
      <path d="M148 125c12 2 22 5 30 9h-30Z" fill={`url(#${g}t)`} opacity=".85" />
      <path d="M92 109l6 4M100 112l6 4M108 115l6 4M116 118l6 4" stroke="#B9C0C6" strokeWidth="2" strokeLinecap="round" />
      <Stones points={[[54, 90], [62, 89], [70, 89], [78, 92], [83, 98]]} r={2.2} />
      <path d="M28 142h150" stroke="#E3E6E8" strokeWidth="1.5" />
    </>
  ),
  outfits: (g) => (
    <>
      <path d="M86 34l-4 14M114 34l4 14" stroke="#B9C0C6" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 48h40l-3 38H83Z" fill={`url(#${g}w)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M83 86h34c19 21 40 50 46 74-21 9-105 9-126 0 6-24 27-53 46-74Z" fill={`url(#${g}m)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M50 140c16 6 34 8 50 8s34-2 50-8M58 122c14 5 28 7 42 7s28-2 42-7" fill="none" stroke="#fff" strokeWidth="2" opacity=".8" />
      <path d="M82 84h36v7H82Z" fill={`url(#${g}t)`} />
      <path d="M100 87c-6-6-14-5-14 0s8 6 14 0Zm0 0c6-6 14-5 14 0s-8 6-14 0Z" fill="#fff" stroke="#AEB4BA" strokeWidth=".8" />
      <Stones points={[[90, 60], [100, 64], [110, 60], [95, 72], [105, 72]]} r={1.9} />
    </>
  ),
  shirts: (g) => (
    <>
      <path d="M72 46 42 62l-15 30 22 11 10-16v87h82V87l10 16 22-11-15-30-30-16c-7 11-49 11-56 0Z" fill={`url(#${g}w)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M72 46c7 11 49 11 56 0l-5-2c-8 8-38 8-46 0Z" fill={`url(#${g}m)`} />
      <path d="M100 124c-9-7-20-14-20-23 0-5 4-9 9-9 5 0 8 3 11 7 3-4 6-7 11-7 5 0 9 4 9 9 0 9-11 16-20 23Z" fill={`url(#${g}m)`} stroke={`url(#${g}t)`} strokeWidth="1.4" />
      <path d="M86 140h28" stroke="#C9CDD1" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  ties: (g) => (
    <>
      <path d="M88 34h24l-5 18H93Z" fill={`url(#${g}t)`} stroke={LINE} strokeWidth="1" />
      <path d="M93 52h14l11 98-18 22-18-22Z" fill={`url(#${g}m)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M92 70l20 14M89 96l25 17M87 122l28 19" stroke="#fff" strokeWidth="4" opacity=".75" />
      <Stones points={[[100, 62], [99, 82], [100, 104], [101, 128], [100, 150]]} r={2.2} />
    </>
  ),
  tumblers: (g) => (
    <>
      <path d="M113 48l11-28" stroke="#B9C0C6" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 48h68c3 0 5 2 5 5v6c0 2-2 4-4 4H65c-2 0-4-2-4-4v-6c0-3 2-5 5-5Z" fill={`url(#${g}w)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M69 63h62l-7 96c-1 6-5 9-11 9H87c-6 0-10-3-11-9Z" fill={`url(#${g}m)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M72 96h56l-1 10H73Z" fill="#fff" opacity=".7" />
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={78 + (i % 6) * 8.8} cy={120 + Math.floor(i / 6) * 9} r="1.6" fill="#fff" opacity=".9" />
      ))}
      <path d="M80 70c-2 30-2 60 0 86" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".45" />
    </>
  ),
  socks: (g) => (
    <>
      <g transform="translate(14 6) rotate(6 100 100)" opacity=".7">
        <path d="M78 32h32v72l25 25c10 10 4 29-13 29-8 0-12-2-18-8l-26-27Z" fill="#EEF0F2" stroke={LINE} strokeWidth="1" />
      </g>
      <path d="M72 30h34v74l26 26c10 10 4 30-14 30-8 0-12-2-18-8l-28-28Z" fill={`url(#${g}w)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M72 30h34v16H72Z" fill={`url(#${g}m)`} />
      <path d="M72 50h34" stroke={`url(#${g}t)`} strokeWidth="2.5" />
      <path d="M118 144c6 0 10 4 10 8-4 6-12 8-18 4Z" fill={`url(#${g}m)`} />
      <path d="M89 86c-4-3-9-6-9-10 0-2 2-4 4-4s4 1 5 3c1-2 3-3 5-3s4 2 4 4c0 4-5 7-9 10Z" fill={`url(#${g}t)`} />
    </>
  ),
  hats: (g) => (
    <>
      <path d="M44 124c0-36 23-56 55-56s52 21 52 52v4Z" fill={`url(#${g}w)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M140 118c22 0 36 6 38 13-32 5-74 3-102 0 4-6 30-13 64-13Z" fill={`url(#${g}m)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M99 68v56M72 78c10 14 14 30 14 46" fill="none" stroke="#DCDFE2" strokeWidth="1.4" />
      <circle cx="99" cy="67" r="4" fill={`url(#${g}t)`} />
      <Stones points={[[108, 96], [116, 92], [124, 92], [132, 96], [112, 104], [128, 104], [120, 110]]} r={2} />
    </>
  ),
  jackets: (g) => (
    <>
      <path d="M72 38 46 50 34 158l40 6 6-72 20-32 20 32 6 72 40-6-12-108-26-12-28 22Z" fill={`url(#${g}s)`} stroke={LINE} strokeWidth="1.2" />
      <path d="M72 38l28 22 28-22 6 4-14 20-20-2-20 2-14-20Z" fill="#E9ECEE" stroke={LINE} strokeWidth="1" />
      <path d="M100 60v104" stroke="#9AA2A9" strokeWidth="1.4" />
      <path d="M58 96h18v16H58ZM124 96h18v16h-18Z" fill="none" stroke={`url(#${g}t)`} strokeWidth="1.6" strokeDasharray="3 2.5" />
      <Stones points={[[66, 128], [72, 134], [64, 140], [134, 128], [128, 134], [136, 140]]} r={2} />
    </>
  ),
};

export default function ProductArt({ category, className = '', shadow = true }) {
  const g = useId().replace(/:/g, '');
  const render = renders[category] || renders.shoes;
  return (
    <svg className={`product-art ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${g}w`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".6" stopColor="#F2F4F5" />
          <stop offset="1" stopColor="#D9DDE0" />
        </linearGradient>
        <linearGradient id={`${g}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9FBF7" />
          <stop offset=".55" stopColor="#A9E9DE" />
          <stop offset="1" stopColor="#5FCFBF" />
        </linearGradient>
        <linearGradient id={`${g}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4FCDBB" />
          <stop offset="1" stopColor="#07877C" />
        </linearGradient>
        <linearGradient id={`${g}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3F5F6" />
          <stop offset=".5" stopColor="#D4D9DD" />
          <stop offset="1" stopColor="#B4BBC1" />
        </linearGradient>
        <radialGradient id={`${g}sh`}>
          <stop offset="0" stopColor="#0B4F49" stopOpacity=".18" />
          <stop offset="1" stopColor="#0B4F49" stopOpacity="0" />
        </radialGradient>
      </defs>
      {shadow && <ellipse cx="102" cy="176" rx="70" ry="9" fill={`url(#${g}sh)`} />}
      {render(g)}
    </svg>
  );
}
