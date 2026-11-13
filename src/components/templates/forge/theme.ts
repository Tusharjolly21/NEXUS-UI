/** Forge's type and its iron-and-heat palette. */

export const FONT_SANS = "'Archivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_MONO = "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

/** The hero is dark iron; files glow by how often they change, like metal in a forge. */
export const IRON = {
  bg: "#131416",
  panel: "#1b1d21",
  raise: "#24272c",
  line: "#2c3036",
  text: "#eceae4",
  muted: "#a1a1a8",
  ember: "#ff7a1a",
  emberInk: "#2a1200",
};

/** Cold to white-hot. A file's heat is how often it changed in the last 90 days. */
export const HEAT = ["#2a2d33", "#363b43", "#4d4237", "#8a4a1f", "#d0601a", "#ff8a33", "#ffc48a", "#fff0d9"];

export const heatColor = (h: number) => HEAT[Math.max(0, Math.min(HEAT.length - 1, Math.round(h * (HEAT.length - 1))))];

/**
 * Archivo and JetBrains Mono (both SIL Open Font Licence), self-hosted from /public/fonts/forge with their licences.
 * Only the Latin and Latin Extended subsets ship.
 */
const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family: string, file: string, extra: string, range: string) =>
  `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:100 900;${extra}src:url("/fonts/forge/${file}.woff2") format("woff2-variations");unicode-range:${range}}`;

export const FONT_CSS = [
  face("Archivo Variable", "archivo-latin-ext", "font-stretch:62% 125%;", LATIN_EXT),
  face("Archivo Variable", "archivo-latin", "font-stretch:62% 125%;", LATIN),
  face("JetBrains Mono Variable", "jetbrains-mono-latin-ext", "", LATIN_EXT),
  face("JetBrains Mono Variable", "jetbrains-mono-latin", "", LATIN),
].join("\n");

/** Headings are set wide and heavy, like stamped steel. */
export const BASE_CSS = `
.fg h1,.fg h2,.fg h3{font-family:${FONT_SANS};font-stretch:116%;font-weight:720}
.fg h1{font-stretch:122%;font-weight:780}
.fg ::selection{background:${IRON.ember};color:${IRON.emberInk}}
`;
