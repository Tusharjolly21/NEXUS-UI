export const FONT_SANS = "'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export const COLORS = {
  bg: "#0B0B0C",
  card: "#141416",
  line: "rgba(255,255,255,.07)",
  line2: "rgba(255,255,255,.12)",
  ink: "#EDEDEF",
  text: "#A3A3AA",
  soft: "#74747C",
  faint: "#4E4E55",
  blue: "#4B6BFB",
  ok: "#3DD68C",
  okBg: "rgba(61,214,140,.12)",
  bad: "#FF5C66",
};

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const CONTAINER = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";

/** Inter, self-hosted from /public/fonts/surfaced (Open Font Licence). */
export const FONT_CSS = `
@font-face{font-family:"Inter Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/surfaced/inter-latin.woff2") format("woff2")}
`;

/** Selection, focus rings and keyframes Tailwind does not cover. */
export const BASE_CSS = `
.sf ::selection{background:${COLORS.blue};color:#fff}
.sf :focus-visible{outline:2px solid ${COLORS.blue};outline-offset:3px;border-radius:10px}
@keyframes sf-spin{to{transform:rotate(360deg)}}
.sf .sf-spin{animation:sf-spin .9s linear infinite}
.sf .sf-orbit{animation:sf-spin 7s linear infinite}
@keyframes sf-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.sf .sf-shimmer{background:linear-gradient(90deg,#74747C 0%,#EDEDEF 50%,#74747C 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sf-shimmer 1.6s linear infinite}
@keyframes sf-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes sf-dots{0%,80%,100%{opacity:.25}40%{opacity:1}}
@media (prefers-reduced-motion: reduce){.sf .sf-spin,.sf .sf-shimmer,.sf .sf-orbit{animation:none!important}}
`;

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
