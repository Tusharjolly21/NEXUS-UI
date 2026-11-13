/** Asteria's type and night palette. */

export const FONT_SANS = "'Hanken Grotesk Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_DISPLAY = "'Fraunces Variable', Georgia, 'Times New Roman', serif";

/** The hero is a night sky; everything below it is daylight. */
export const NIGHT = {
  top: "#070922",
  mid: "#141a4a",
  low: "#2a2f6e",
  roof: "#05061a",
  star: "#eef0ff",
  mist: "#a9aed6",
  lamp: "#ffb648",
  lampInk: "#241500",
};

/**
 * Fraunces and Hanken Grotesk (both SIL Open Font Licence), self-hosted from /public/fonts/asteria with their
 * licences. Only the Latin and Latin Extended subsets ship.
 */
const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family: string, file: string, weight: string, range: string) =>
  `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:${weight};src:url("/fonts/asteria/${file}.woff2") format("woff2-variations");unicode-range:${range}}`;

export const FONT_CSS = [
  face("Fraunces Variable", "fraunces-latin-ext", "100 900", LATIN_EXT),
  face("Fraunces Variable", "fraunces-latin", "100 900", LATIN),
  face("Hanken Grotesk Variable", "hanken-grotesk-latin-ext", "100 900", LATIN_EXT),
  face("Hanken Grotesk Variable", "hanken-grotesk-latin", "100 900", LATIN),
].join("\n");

/** Headings take the display face; the generated sample pages (`.ast-page`) keep their own sans. */
export const BASE_CSS = `
.ast h1,.ast h2,.ast h3{font-family:${FONT_DISPLAY};font-variation-settings:"SOFT" 60,"WONK" 1;font-optical-sizing:auto}
.ast h2,.ast h3{letter-spacing:-0.03em}
.ast .ast-page h3{font-family:inherit;font-variation-settings:normal}
@keyframes ast-twinkle{0%,100%{opacity:var(--o,.7)}50%{opacity:calc(var(--o,.7)*.25)}}
.ast .ast-tw{animation:ast-twinkle var(--d,4s) ease-in-out var(--l,0s) infinite}
@media (prefers-reduced-motion:reduce){.ast .ast-tw{animation:none}}
`;
