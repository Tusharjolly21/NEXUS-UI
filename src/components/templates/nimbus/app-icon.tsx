import { useId, type CSSProperties } from "react";

/**
 * The Nimbus app icon: a deep-blue dusk gradient, a glowing ring and a frosted-glass cloud that blurs
 * what is behind it. It is drawn in SVG so it stays sharp at every size. Gradient ids are generated per
 * instance because several icons can be on the page at once.
 */
export function AppIcon({ size = 64, className = "", style }: { size?: number; className?: string; style?: CSSProperties }) {
  const id = "nbi" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = (name: string) => `url(#${id}${name})`;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={style} role="img" aria-label="Nimbus app icon">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06113a" />
          <stop offset="0.46" stopColor="#163795" />
          <stop offset="0.76" stopColor="#3a72e0" />
          <stop offset="0.91" stopColor="#93abea" />
          <stop offset="1" stopColor="#ffbe8a" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="50" cy="42" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe6b8" stopOpacity=".42" />
          <stop offset="0.5" stopColor="#ffb46b" stopOpacity=".1" />
          <stop offset="1" stopColor="#ffb46b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}ring`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#ffeccb" />
          <stop offset="1" stopColor="#ffb066" />
        </linearGradient>
        <linearGradient id={`${id}glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".78" />
          <stop offset="0.55" stopColor="#eef4ff" stopOpacity=".46" />
          <stop offset="1" stopColor="#cfe0ff" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity=".25" />
          <stop offset="1" stopColor="#fff" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={`${id}frost`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id={`${id}drop`} x="-30%" y="-30%" width="160%" height="190%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#040c2c" floodOpacity=".5" />
        </filter>
        {/* The rounded square (a superellipse, like the system icon shape) and the cloud outline. */}
        <path
          id={`${id}sqp`}
          d="M50 0C77.6 0 87.3 0 93.6 6.4 100 12.7 100 22.4 100 50s0 37.3-6.4 43.6C87.3 100 77.6 100 50 100s-37.3 0-43.6-6.4C0 87.3 0 77.6 0 50s0-37.3 6.4-43.6C12.7 0 22.4 0 50 0Z"
        />
        <path id={`${id}cl`} d="M30 78h40.5a10 10 0 0 0 1.3-19.9A14 14 0 0 0 46 54.2a11 11 0 0 0-17 9.1A7.5 7.5 0 0 0 30 78Z" />
        <clipPath id={`${id}sq`}>
          <use href={`#${id}sqp`} />
        </clipPath>
        <clipPath id={`${id}clc`}>
          <use href={`#${id}cl`} />
        </clipPath>
      </defs>
      <g clipPath={ref("sq")}>
        <rect width="100" height="100" fill={ref("bg")} />
        <rect width="100" height="100" fill={ref("glow")} />
        <circle cx="50" cy="42" r="24" fill="none" stroke="#ffd59a" strokeWidth="7" opacity=".5" filter={ref("soft")} />
        <circle cx="50" cy="42" r="24" fill="none" stroke={ref("ring")} strokeWidth="3.6" />
        <use href={`#${id}cl`} filter={ref("drop")} fill="#fff" fillOpacity=".01" />
        <g clipPath={ref("clc")}>
          <rect width="100" height="100" fill={ref("bg")} filter={ref("frost")} />
          <circle cx="50" cy="42" r="24" fill="none" stroke="#ffe4b8" strokeWidth="7" filter={ref("frost")} />
          <use href={`#${id}cl`} fill={ref("glass")} />
          <ellipse cx="40" cy="61" rx="9" ry="4" fill="#fff" opacity=".55" filter={ref("soft")} />
        </g>
        <use href={`#${id}cl`} fill="none" stroke={ref("rim")} strokeWidth="1" />
        <rect width="100" height="100" fill={ref("gloss")} />
      </g>
      <use href={`#${id}sqp`} fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth=".8" />
    </svg>
  );
}
