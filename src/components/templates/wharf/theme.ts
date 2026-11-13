export const FONT_SANS = "'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace";
/** Wharf is near-white with ink and one electric blue. */
export const COLOR = {
  bg: "#F7F7F8",
  ink: "#111214",
  text: "#4E5159",
  soft: "#6C6F76",
  faint: "#A0A3A9",
  line: "rgba(17,18,20,.08)",
  line2: "rgba(17,18,20,.12)",
  blue: "#2F6BFF",
  deep: "#1E54E6",
  mid: "#6F9BFF",
  pale: "#C3D6FF",
  wash: "#EAF1FF",
  green: "#16A34A",
  greenWash: "#DDF8E6",
  dark: "#16171A",
  dark2: "#1F2125",
};
export const EASE = [0.16, 1, 0.3, 1] as const;
export const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
};
/** Rounds an SVG coordinate to 2 decimals, so the server and the browser print the same trig results. */
export const r2 = (value: number) => Math.round(value * 100) / 100;

export const CONTAINER = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";
/**
 * Geist and Geist Mono (both SIL Open Font Licence), self-hosted from /public/fonts/wharf with their licences.
 * Only the Latin and Latin Extended subsets ship; add more from Fontsource if your copy needs them.
 */
const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family: string, file: string, range: string) =>
  `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:100 900;src:url("/fonts/wharf/${file}.woff2") format("woff2-variations");unicode-range:${range}}`;
export const FONT_CSS = [
  face("Geist Variable", "geist-latin-ext", LATIN_EXT),
  face("Geist Variable", "geist-latin", LATIN),
  face("Geist Mono Variable", "geist-mono-latin-ext", LATIN_EXT),
  face("Geist Mono Variable", "geist-mono-latin", LATIN),
].join("\n");
export const BASE_CSS = `
.wf ::selection{background:${COLOR.pale}}
.wf .wf-ring:focus-visible{outline:2px solid ${COLOR.blue};outline-offset:2px}
@keyframes wf-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes wf-spin{to{transform:rotate(360deg)}}
@keyframes wf-blink{50%{opacity:0}}
@keyframes wf-belt2{0%{transform:translateX(0);opacity:0}10%{opacity:1}88%{opacity:1}100%{transform:translateX(106px);opacity:0}}
@keyframes wf-dash{to{stroke-dashoffset:-14}}
@keyframes wf-belt{from{transform:translateX(-34px)}to{transform:translateX(132px)}}
@media (prefers-reduced-motion: reduce){.wf .wf-anim{animation:none!important}}
`;
