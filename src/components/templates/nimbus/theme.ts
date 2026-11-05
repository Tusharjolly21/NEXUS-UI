/**
 * Design tokens for the Nimbus template. Colours are hard-coded (not CSS variables) so the page looks
 * the same inside a dark-mode host, and `NIMBUS_CSS` holds the few rules Tailwind utilities cannot express.
 */

/** Primary text. */
export const INK = "#1d1d1f";
/** Secondary text on white and light grey. */
export const MUTED = "#6e6e73";
/** Tertiary text, axis labels, disabled list items. */
export const FAINT = "#86868b";
/** The one accent colour: links, the radar's primary action, focus rings. */
export const BLUE = "#0071e3";
/** The light grey page and card background used between white sections. */
export const SURFACE = "#f5f5f7";

/** Apple-style ease-out used by every reveal. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Snappy spring for the sliding selection pills, the hover scale on buttons and list reveals. */
export const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

/**
 * System font stack: SF Pro on Apple devices, then Inter if the visitor has it installed, then the
 * platform default. No font files are downloaded.
 */
export const FONT_STACK =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * Scoped styles. Everything hangs off `#nimbus-root`. The resets sit in `@layer base` with `:where()` so they
 * have the lowest possible priority and any Tailwind utility on an element still wins over them (unlayered
 * CSS would beat Tailwind's layered utilities).
 */
export const NIMBUS_CSS = `
#nimbus-root{background:#fff;color:${INK};font-family:${FONT_STACK};font-size:16px;line-height:1.5;letter-spacing:-0.011em;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-text-size-adjust:100%;overflow-x:clip}
@layer base{
:where(#nimbus-root) *,:where(#nimbus-root) *::before,:where(#nimbus-root) *::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e5ea}
:where(#nimbus-root) button{font:inherit;letter-spacing:inherit;color:inherit;background:transparent;border:0;padding:0;margin:0;cursor:pointer}
:where(#nimbus-root) a{color:inherit;text-decoration:none}
:where(#nimbus-root) h1,:where(#nimbus-root) h2,:where(#nimbus-root) p,:where(#nimbus-root) ul,:where(#nimbus-root) ol{margin:0;padding:0}
:where(#nimbus-root) img,:where(#nimbus-root) svg,:where(#nimbus-root) canvas{display:block}
}
:where(#nimbus-root) ::selection{background:rgba(0,113,227,.2)}
#nimbus-root .nb-ring:focus-visible{outline:2px solid ${BLUE};outline-offset:3px}
`;
