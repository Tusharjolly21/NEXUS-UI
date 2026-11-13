export const FONT_SANS = "'Instrument Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export const COLORS = {
  night: "#060A17",
  deep: "#0B1124",
  card: "#0E152C",
  raise: "#141C38",
  line: "rgba(150,170,255,.10)",
  line2: "rgba(150,170,255,.18)",
  ink: "#ECEFF8",
  text: "#A6AECA",
  soft: "#6E7898",
  faint: "#4A5371",
  ok: "#5BE3B0",
  bad: "#FF5D6C",
};

export const DAWN = ["#FF6B5A", "#FF8E5E", "#FFB86B"];

export const DAWN_GRADIENT = `linear-gradient(90deg, ${DAWN.join(", ")})`;

export const DAWN_DIAGONAL = `linear-gradient(135deg, ${DAWN[0]}, ${DAWN[2]})`;

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";

/** Instrument Sans and Geist Mono, self-hosted from /public/fonts/nightwatch (both Open Font Licence). */
export const FONT_CSS = `
@font-face{font-family:"Instrument Sans Variable";font-style:normal;font-display:swap;font-weight:400 700;src:url("/fonts/nightwatch/instrument-sans-latin.woff2") format("woff2")}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/nightwatch/geist-mono-latin.woff2") format("woff2")}
`;

/** Selection, focus rings and the keyframes Tailwind does not cover. */
export const BASE_CSS = `
.nw ::selection{background:${DAWN[1]};color:#1A0F0A}
.nw .nw-ring:focus-visible{outline:2px solid ${DAWN[2]};outline-offset:3px}
.nw .nw-dots{background-image:radial-gradient(rgba(150,170,255,.16) 1px, transparent 1px);background-size:22px 22px}
@keyframes nw-spin{to{transform:rotate(360deg)}}
.nw .nw-spin{animation:nw-spin 1s linear infinite}
.nw .nw-spin-slow{animation:nw-spin 18s linear infinite}
@keyframes nw-ping{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.4);opacity:0}}
.nw .nw-ping{animation:nw-ping 2.4s cubic-bezier(.2,.6,.3,1) infinite}
@keyframes nw-up{from{transform:translateY(0)}to{transform:translateY(-50%)}}
@keyframes nw-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.nw .nw-blink{animation:nw-blink 1s steps(1,end) infinite}
@keyframes nw-twinkle{0%,100%{opacity:.15}50%{opacity:.8}}
@media (prefers-reduced-motion: reduce){.nw .nw-spin,.nw .nw-spin-slow,.nw .nw-ping,.nw .nw-blink{animation:none!important}}
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
