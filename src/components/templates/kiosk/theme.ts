export const FONT_SANS = "'Inter Tight Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_SERIF = "'Newsreader Variable', Georgia, 'Times New Roman', serif";

/** Kiosk is ink on white with one highlighter yellow (`hi`). */
export const COLOR = {
  ink: "#0C0C0D",
  text: "#3F4045",
  soft: "#6E6F75",
  faint: "#A2A3A8",
  line: "#ECECEE",
  panel: "#F6F6F7",
  hi: "#E6FF4F",
  hiInk: "#1B1F00",
};

/** the one easing curve Kiosk uses: a quick start and a long, soft landing */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
};

export const CONTAINER = "mx-auto w-full max-w-[1240px] px-5 sm:px-8";

/**
 * Inter Tight and Newsreader (both SIL Open Font Licence), self-hosted from /public/fonts/kiosk with their licences.
 * Only the Latin and Latin Extended subsets ship; add more from Fontsource if your stories need them.
 */
const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
export const FONT_CSS = `
@font-face{font-family:"Inter Tight Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/kiosk/inter-tight-normal-latin-ext.woff2") format("woff2-variations");unicode-range:${LATIN_EXT}}
@font-face{font-family:"Inter Tight Variable";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/kiosk/inter-tight-normal-latin.woff2") format("woff2-variations");unicode-range:${LATIN}}
@font-face{font-family:"Newsreader Variable";font-style:normal;font-display:swap;font-weight:200 800;src:url("/fonts/kiosk/newsreader-normal-latin-ext.woff2") format("woff2-variations");unicode-range:${LATIN_EXT}}
@font-face{font-family:"Newsreader Variable";font-style:normal;font-display:swap;font-weight:200 800;src:url("/fonts/kiosk/newsreader-normal-latin.woff2") format("woff2-variations");unicode-range:${LATIN}}
`;

/** Page-wide styles the utility classes cannot express: selection, focus rings, the two keyframes, the drop cap. */
export const BASE_CSS = `
.ks ::selection{background:${COLOR.hi};color:${COLOR.hiInk}}
.ks .ks-ring:focus-visible{outline:2px solid ${COLOR.ink};outline-offset:3px}
@keyframes ks-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes ks-float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-10px) rotate(var(--r,0deg))}}
.ks .ks-body p{margin:0 0 1.25em}
.ks .ks-dropcap::first-letter{font-family:${FONT_SANS};float:left;font-size:4.1em;line-height:.86;font-weight:700;margin:.06em .1em 0 0;color:${COLOR.ink}}
@media (prefers-reduced-motion: reduce){.ks .ks-anim{animation:none!important}}
`;
