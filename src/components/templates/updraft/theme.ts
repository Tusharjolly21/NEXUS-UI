export const FONT_SANS = "'Onest Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export const COLORS = {
  ink: "#121317",
  text: "#4A4D56",
  soft: "#767A84",
  faint: "#A9ACB4",
  line: "#ECEDF0",
};

export const SPECTRUM = ["#4B3BFF", "#A63CF2", "#FF4D7D", "#FF9A2B"];

export const SPECTRUM_GRADIENT = `linear-gradient(90deg, ${SPECTRUM.join(", ")})`;

export const SPECTRUM_VERTICAL = `linear-gradient(180deg, ${SPECTRUM.join(", ")})`;

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const EASE_OUT: [number, number, number, number] = [0.165, 0.84, 0.44, 1];

export const CONTAINER = "mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12";

/** Onest and Geist Mono, self-hosted from /public/fonts/updraft (both Open Font Licence). */
export const FONT_CSS = `
@font-face{font-family:"Onest Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/updraft/onest-latin.woff2") format("woff2")}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/updraft/geist-mono-latin.woff2") format("woff2")}
`;

/** Selection, focus rings and keyframes Tailwind does not cover, under the `.ud` wrapper. */
export const BASE_CSS = `
.ud ::selection{background:#E9E4FF;color:${COLORS.ink}}
.ud .ud-ring:focus-visible{outline:2px solid ${COLORS.ink};outline-offset:3px}
.ud .ud-ring-w:focus-visible{outline:2px solid #fff;outline-offset:3px}
.ud .ud-noscroll::-webkit-scrollbar{display:none}.ud .ud-noscroll{scrollbar-width:none}
@keyframes ud-blink{0%,45%{opacity:1}55%,100%{opacity:0}}
.ud .ud-blink{animation:ud-blink 1.05s steps(1,end) infinite}
@keyframes ud-bob{0%,100%{transform:translateY(-9px)}50%{transform:translateY(9px)}}
.ud .ud-bob{animation:ud-bob 4.2s cubic-bezier(.45,0,.55,1) infinite}
@keyframes ud-spin{to{transform:rotate(360deg)}}
.ud .ud-spin{animation:ud-spin 14s linear infinite}
.ud .ud-spin-fast{animation:ud-spin 1.1s linear infinite}
@keyframes ud-flow{to{background-position:300% 0}}
.ud .ud-flow{background-size:300% 100%;animation:ud-flow 3.2s linear infinite}
@keyframes ud-drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes ud-pulse{0%,70%,100%{opacity:.35;transform:scale(1)}20%{opacity:1;transform:scale(1.08)}}
.ud .ud-node{animation:ud-pulse 4.5s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion: reduce){.ud .ud-blink,.ud .ud-bob,.ud .ud-spin,.ud .ud-flow,.ud .ud-node,.ud .ud-spin-fast{animation:none!important}}
`;

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

/** A small seeded random number generator (mulberry32), so drawings come out the same every load. */
export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 1831565813) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Twelve colours stepped evenly along the spectrum, for the dash and dot fields. */
export const SPECTRUM_STEPS = Array.from(
  {
    length: 12,
  },
  (_, index) => {
    const at = (index / 11) * (SPECTRUM.length - 1);
    const from = Math.floor(Math.min(at, SPECTRUM.length - 2));
    const mix = at - from;
    const a = hexToRgb(SPECTRUM[from]);
    const b = hexToRgb(SPECTRUM[from + 1]);
    return `rgb(${a.map((channel, i) => Math.round(channel + (b[i] - channel) * mix)).join(",")})`;
  },
);

/** Code colours for the editor and terminal mockups. */
export const SYN_KEYWORD = "#B04AE8";

export const SYN_FUNCTION = "#3D5AFE";

export const SYN_STRING = "#D9480F";

export const SYN_ADDED = "#0F8A6A";

export const SYN_PLAIN = "#2A2C33";

export const SYN_MUTED = "#9A9DA6";
