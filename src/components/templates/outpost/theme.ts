export const FONT_SANS = "'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";

export const DARK = {
  bg: "#09090B",
  card: "#111114",
  raise: "#1E1E23",
  line: "rgba(255,255,255,.07)",
  line2: "rgba(255,255,255,.12)",
  ink: "#F1EFEA",
  text: "#A1A1AA",
  soft: "#71717A",
  faint: "#3F3F46",
  teal: "#3FE0C5",
  amber: "#F6B24B",
  rose: "#F27A8C",
  violet: "#A594FF",
  sky: "#6AA9FF",
};

export const LIGHT = {
  bg: "#FFFFFF",
  panel: "#F7F7F5",
  line: "#ECEBE7",
  ink: "#18181B",
  text: "#52525B",
  soft: "#8A8A93",
  ok: "#0E9F6E",
  accent: "#0F9C86",
};

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const CONTAINER = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";

/** Inter and Geist Mono, self-hosted from /public/fonts/outpost (both Open Font Licence). */
export const FONT_CSS = `
@font-face{font-family:"Inter Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/outpost/inter-latin.woff2") format("woff2")}
@font-face{font-family:"Geist Mono Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/outpost/geist-mono-latin.woff2") format("woff2")}
`;

/** Selection, focus rings and the few keyframes Tailwind does not cover, all under the `.op` wrapper. */
export const BASE_CSS = `
.op ::selection{background:${DARK.teal};color:#06201B}
.op :focus-visible{outline:2px solid ${DARK.teal};outline-offset:3px;border-radius:10px}
@keyframes op-spin{to{transform:rotate(360deg)}}
.op .op-spin{animation:op-spin .9s linear infinite}
@keyframes op-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.op .op-caret{animation:op-blink 1s steps(1) infinite}
@keyframes op-pulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.6);opacity:0}}
.op .op-pulse{animation:op-pulse 1.8s ease-out infinite}
@keyframes op-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.op .op-shimmer{background:linear-gradient(90deg,#71717A 0%,#F1EFEA 50%,#71717A 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:op-shimmer 2.2s linear infinite}
.op .op-noscroll::-webkit-scrollbar{display:none}.op .op-noscroll{scrollbar-width:none}
@media (prefers-reduced-motion: reduce){.op .op-spin,.op .op-caret,.op .op-pulse,.op .op-shimmer{animation:none!important}}
`;

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export const formatNumber = (value: number) => value.toLocaleString("en-US");
