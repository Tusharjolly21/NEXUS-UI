import type { Transition } from "framer-motion";

export const FONT_SANS = "'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export const COLORS = {
  bg: "var(--bg)",
  panel: "var(--panel)",
  card: "var(--card)",
  card2: "var(--card2)",
  well: "var(--well)",
  pop: "var(--pop)",
  line: "var(--line)",
  line2: "var(--line2)",
  ink: "var(--ink)",
  text: "var(--text)",
  soft: "var(--soft)",
  faint: "var(--faint)",
  accent: "var(--accent)",
  accentInk: "var(--accent-ink)",
  accentSoft: "var(--accent-soft)",
  btn: "var(--btn)",
  s1: "var(--s1)",
  s2: "var(--s2)",
  s3: "var(--s3)",
  s4: "var(--s4)",
  neutral: "var(--vneutral)",
  good: "var(--good)",
  warn: "var(--warn)",
};

/** Inter and Geist Mono, self-hosted (both under the SIL Open Font License). */
export const FONT_CSS = `
@font-face{font-family:"Inter Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/meridian/inter-latin.woff2") format("woff2")}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/meridian/geist-mono-latin.woff2") format("woff2")}
`;

export const BASE_CSS = `
.md{--bg:#0A0A0C;--panel:#0F0F12;--card:#16161A;--card2:#1C1C21;--well:#121216;--pop:#1E1E23;--line:rgba(255,255,255,.065);--line2:rgba(255,255,255,.11);
--ink:#EDEDEF;--text:#A9A9B2;--soft:#8A8A94;--faint:#3A3A42;--accent:#4A86E8;--accent-ink:#93B6F6;--accent-soft:rgba(74,134,232,.14);--btn:#2F6BD6;
--s1:#4A86E8;--s2:#1F9E7A;--s3:#8F84E8;--s4:#B9842C;--vneutral:#4B4B55;--good:#3FBF75;--warn:#E9A23B;--bad:#E5615C;
--good-ink:#6FD69A;--bad-ink:#F08A84;--good-bg:rgba(63,191,117,.12);--bad-bg:rgba(229,97,92,.13);
--card-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 0 0 1px rgba(255,255,255,.035);--pop-shadow:0 0 0 1px rgba(255,255,255,.08),0 24px 60px -12px rgba(0,0,0,.7),0 8px 20px -8px rgba(0,0,0,.5);
--seg:#26262C;--seg-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 1px 2px rgba(0,0,0,.4);--heat0:#1B1B21;color-scheme:dark}
.md[data-theme=light]{--bg:#EEEEEB;--panel:#F7F7F5;--card:#FFFFFF;--card2:#F9F9F8;--well:#F3F3F1;--pop:#FFFFFF;--line:rgba(17,17,26,.07);--line2:rgba(17,17,26,.12);
--ink:#16161A;--text:#4F4F58;--soft:#696973;--faint:#C9C9CF;--accent:#2F6BD6;--accent-ink:#2459BC;--accent-soft:rgba(47,107,214,.10);--btn:#2F6BD6;
--s1:#2F6BD6;--s2:#1A9470;--s3:#6D5FD6;--s4:#B07A1C;--vneutral:#B5B5BD;--good:#1E9E55;--warn:#C98512;--bad:#D2453F;
--good-ink:#167A41;--bad-ink:#B8352F;--good-bg:rgba(30,158,85,.10);--bad-bg:rgba(210,69,63,.09);
--card-shadow:0 0 0 1px rgba(17,17,26,.05),0 1px 2px rgba(17,17,26,.04),0 10px 30px -18px rgba(17,17,26,.18);--pop-shadow:0 0 0 1px rgba(17,17,26,.08),0 24px 60px -16px rgba(17,17,26,.28),0 6px 16px -8px rgba(17,17,26,.14);
--seg:#FFFFFF;--seg-shadow:0 0 0 1px rgba(17,17,26,.06),0 1px 3px rgba(17,17,26,.10);--heat0:#EDEDEA;color-scheme:light}
.md{font-family:${FONT_SANS};-webkit-font-smoothing:antialiased;font-feature-settings:"cv11","ss01"}
.md ::selection{background:var(--accent);color:#fff}
.md :focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:8px}
.md .md-scroll::-webkit-scrollbar{width:10px;height:10px}.md .md-scroll::-webkit-scrollbar-thumb{background:var(--line2);border-radius:99px;border:3px solid transparent;background-clip:padding-box}
.md .md-scroll::-webkit-scrollbar-track{background:transparent}
.md .md-noscroll::-webkit-scrollbar{display:none}.md .md-noscroll{scrollbar-width:none}
.md .md-row:hover{background:var(--card2)}
.md .md-hov{transition:background-color .15s,color .15s}.md .md-hov:hover{background:var(--well);color:var(--ink)}
.md input:focus-visible,.md textarea:focus-visible{outline:none}
.md .md-field{transition:box-shadow .15s}.md .md-field:focus-within{box-shadow:0 0 0 2px var(--accent)}
.md input::placeholder,.md textarea::placeholder{color:var(--soft)}
.md .md-halo{paint-order:stroke;stroke:var(--card);stroke-width:4px;stroke-linejoin:round}
@keyframes md-pulse{0%{transform:scale(.6);opacity:.8}100%{transform:scale(2.4);opacity:0}}
.md .md-pulse{animation:md-pulse 2s ease-out infinite}
@media (prefers-reduced-motion: reduce){.md .md-pulse{animation:none!important}}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
`;

export const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
};

export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 26,
};

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export const formatNumber = (value: number) => Math.round(value).toLocaleString("en-US");

export const formatMoney = (value: number) =>
  `${value < 0 ? "-" : ""}$${Math.round(Math.abs(value)).toLocaleString("en-US")}`;

export const formatCompactMoney = (value: number, digits = 1) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return abs >= 1e6
    ? `${sign}$${(abs / 1e6).toFixed(2)}M`
    : abs >= 1e3
      ? `${sign}$${(abs / 1e3).toFixed(digits)}k`
      : `${sign}$${Math.round(abs)}`;
};

export const formatSignedMoney = (value: number) => `${value >= 0 ? "+" : "-"}${formatCompactMoney(Math.abs(value))}`;

/** A small seeded generator (mulberry32), so the sample data is the same on every visit. */
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 1831565813) >>> 0;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);
