/**
 * Components that have a captured frame at /public/posters/<slug>.webp. Tiles request a poster only for
 * these: asking for a missing file made the image optimiser answer 400, which crawlers report as a broken
 * image (the tile itself already fell back to a Play button in the browser). Add the slug when you add a poster.
 */
export const POSTER_SLUGS: ReadonlySet<string> = new Set([
  "black-hole-delete",
  "catch-undo",
  "frost-input",
  "portal-card",
  "pumpkin-reveal",
  "shredder-delete",
  "venom-button",
  "web-sling-button",
]);
