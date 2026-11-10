export const FONT_DISPLAY =
  "'Inter Tight Variable', 'Geist Variable', -apple-system, sans-serif";

export const FONT_SANS =
  "'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/** Plotline is white and cool grey with ink type and one cobalt accent. */
export const COLOR = {
  ink: "#0E1116",
  text: "#4D5562",
  soft: "#6B7380",
  faint: "#9AA1AC",
  line: "rgba(14,17,22,.08)",
  line2: "rgba(14,17,22,.12)",
  panel: "#F5F6F8",
  panel2: "#EEF0F3",
  accent: "#3355FF",
  accentSoft: "#E9EDFF",
  red: "#E5484D",
  green: "#2F9E62",
};

export const EASE = [0.16, 1, 0.3, 1] as const;

export const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
};

/** Rounds a coordinate to 2 decimals, so the server and the browser print the same trig results. */
export const r2 = (value: number) => Math.round(value * 100) / 100;

export const CONTAINER = "mx-auto w-full max-w-[1280px]";

/**
 * Inter Tight and Geist (both SIL Open Font Licence), self-hosted from /public/fonts/plotline with their licences.
 * Only the Latin and Latin Extended subsets ship; add more from Fontsource if your copy needs them.
 */
const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family: string, file: string, range: string) =>
  `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/plotline/${file}.woff2") format("woff2-variations");unicode-range:${range}}`;
export const FONT_CSS = [
  face("Inter Tight Variable", "inter-tight-latin-ext", LATIN_EXT),
  face("Inter Tight Variable", "inter-tight-latin", LATIN),
  face("Geist Variable", "geist-latin-ext", LATIN_EXT),
  face("Geist Variable", "geist-latin", LATIN),
].join("\n");

export const BASE_CSS = `
.pl ::selection{background:${COLOR.accentSoft}}
.pl .pl-ring:focus-visible{outline:2px solid ${COLOR.accent};outline-offset:2px}
@keyframes pl-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes pl-pulse{0%{box-shadow:0 0 0 0 rgba(51,85,255,.45)}100%{box-shadow:0 0 0 8px rgba(51,85,255,0)}}
@keyframes pl-aurora{0%{transform:translate(0,0) rotate(0)}50%{transform:translate(-6%,4%) rotate(8deg)}100%{transform:translate(0,0) rotate(0)}}
@media (prefers-reduced-motion: reduce){.pl .pl-marquee,.pl .pl-anim{animation:none!important}}
`;
