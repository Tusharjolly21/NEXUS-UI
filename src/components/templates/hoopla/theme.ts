export const FONT_DISPLAY = "'Anton', Impact, 'Arial Narrow Bold', sans-serif";

export const FONT_SANS =
  "'Inter Tight Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export const FONT_HAND = "'Caveat', 'Bradley Hand', cursive";

/** Hoopla is sky blue and white with deep ink outlines and a box of bright sticker colours. */
export const COLOR = {
  sky: "#4F9BFF",
  ink: "#0B1233",
  muted: "#5B6378",
  orange: "#FF7130",
  green: "#55C891",
  yellow: "#F7F17A",
  sun: "#FFD43B",
  lilac: "#E3A1F7",
  pink: "#FF6F7D",
  violet: "#B49BFF",
};

export const INK = COLOR.ink;

export const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 30,
};

/** a springier spring for stickers and pops */
export const BOUNCY = {
  type: "spring" as const,
  stiffness: 520,
  damping: 14,
};

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Rounds a coordinate to 2 decimals, so the server and the browser print the same trig results. */
export const r2 = (value: number) => Math.round(value * 100) / 100;

export const CONTAINER = "mx-auto w-full max-w-[1240px] px-5 sm:px-8";

/**
 * Anton, Inter Tight and Caveat (all SIL Open Font Licence), self-hosted from /public/fonts/hoopla with their licences.
 * Inter Tight ships its Latin and Latin Extended subsets; add more from Fontsource if your copy needs them.
 */
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family: string, file: string, weight: string, range?: string) =>
  `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:${weight};src:url("/fonts/hoopla/${file}.woff2") format("woff2")${range ? `;unicode-range:${range}` : ""}}`;
export const FONT_CSS = [
  face("Anton", "anton-latin", "400"),
  face("Caveat", "caveat-latin", "600"),
  face("Inter Tight Variable", "inter-tight-latin-ext", "100 900", LATIN_EXT),
  face("Inter Tight Variable", "inter-tight-latin", "100 900", LATIN),
].join("\n");

export const BASE_CSS = `
.hp ::selection{background:${COLOR.yellow};color:${COLOR.ink}}
.hp .hp-ring:focus-visible{outline:3px solid ${COLOR.ink};outline-offset:3px}
@media (pointer:fine){.hp.hp-cursor, .hp.hp-cursor a, .hp.hp-cursor button{cursor:none}}
@keyframes hp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes hp-marquee-r{from{transform:translateX(-50%)}to{transform:translateX(0)}}
@keyframes hp-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}
@keyframes hp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.hp .hp-wiggle-host:hover .hp-wiggle{animation:hp-wiggle .5s ease-in-out 2}
@media (prefers-reduced-motion: reduce){.hp .hp-marquee{animation:none!important}.hp .hp-bob{animation:none!important}}
`;
