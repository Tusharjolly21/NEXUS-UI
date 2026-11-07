/**
 * Last Light's styles: one block of plain CSS, scoped under the page's own root (.ll) with every class prefixed
 * "ll-", so it can sit inside any project without touching the rest of it.
 *
 * Fonts: IBM Plex Mono and Libre Caslon Display are self-hosted from /public/fonts/last-light (both SIL Open Font
 * Licence; the licences sit beside the files), so nothing is fetched from Google at build or run time.
 */
export const LAST_LIGHT_CSS = `
@font-face { font-family: "IBM Plex Mono"; font-weight: 400; font-style: normal; font-display: swap; src: url("/fonts/last-light/ibm-plex-mono-400.woff2") format("woff2"); }
@font-face { font-family: "IBM Plex Mono"; font-weight: 500; font-style: normal; font-display: swap; src: url("/fonts/last-light/ibm-plex-mono-500.woff2") format("woff2"); }
@font-face { font-family: "IBM Plex Mono"; font-weight: 700; font-style: normal; font-display: swap; src: url("/fonts/last-light/ibm-plex-mono-700.woff2") format("woff2"); }
@font-face { font-family: "Libre Caslon Display"; font-weight: 400; font-style: normal; font-display: swap; src: url("/fonts/last-light/libre-caslon-display-400.woff2") format("woff2"); }
/* Layout: one full-screen hero. The scene is drawn in characters on a canvas; the words sit low and left, over the dark forest. */
.ll {
  --night: #0c030b;      /* behind everything, the darkest plum of the silhouettes */
  --plum: #1b0816;       /* text on light buttons */
  --bone: #f6dcb0;       /* the sun's cream, for type */
  --bone-soft: rgba(246, 220, 176, 0.78);
  --bone-faint: rgba(246, 220, 176, 0.5);
  --ember: #ff8d4e;      /* the orange of the sky, for focus and the live dot */
  --line: rgba(246, 220, 176, 0.28);
  --display: "Libre Caslon Display", "Libre Caslon Text", Didot, "Bodoni 72", Georgia, serif;
  --mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  color-scheme: dark;
  background: var(--night);
  color: var(--bone);
  font-family: var(--mono);
  overflow-x: hidden;
}

.ll-hero {
  position: relative;
  min-height: max(560px, 100svh);
  display: grid;
  grid-template-rows: auto 1fr auto;
  isolation: isolate;
  overflow: hidden;
  background: var(--night);
}
.ll-hero canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -2; display: block; }
/* a light hand of shade under the nav and behind the words only; the rest of the picture keeps its colour */
.ll-hero::after {
  content: "";
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    linear-gradient(to bottom, rgba(12, 3, 11, 0.32), rgba(12, 3, 11, 0) 12%),
    radial-gradient(62% 52% at 0% 100%, rgba(12, 3, 11, 0.62), rgba(12, 3, 11, 0.3) 55%, rgba(12, 3, 11, 0) 100%),
    linear-gradient(to top, rgba(12, 3, 11, 0.4), rgba(12, 3, 11, 0) 14%);
}

.ll-bar, .ll-stage, .ll-foot {
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
@media (min-width: 720px) {
  .ll-bar, .ll-stage, .ll-foot {
    padding-left: max(40px, env(safe-area-inset-left, 0px));
    padding-right: max(40px, env(safe-area-inset-right, 0px));
  }
}

/* nav */
.ll-bar { display: flex; align-items: center; gap: 28px; padding-block: 22px; }
.ll-brand { display: inline-flex; align-items: center; gap: 10px; color: var(--bone); text-decoration: none; font-family: var(--display); font-size: 22px; letter-spacing: 0.01em; }
.ll-brand svg { flex: none; }
.ll-links { display: none; gap: 26px; margin-left: auto; }
.ll-links a, .ll-bar .ll-cta-sm { color: var(--bone-soft); text-decoration: none; font-size: 13px; letter-spacing: 0.02em; transition: color 0.2s; }
.ll-links a:hover { color: var(--bone); }
.ll-bar .ll-cta-sm { margin-left: auto; color: var(--bone); padding: 8px 14px; border: 1px solid var(--line); border-radius: 3px; background: rgba(12, 3, 11, 0.35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); transition: border-color 0.2s, background 0.2s; }
.ll-bar .ll-cta-sm:hover { border-color: var(--bone-faint); background: rgba(12, 3, 11, 0.55); }
@media (min-width: 860px) {
  .ll-links { display: flex; }
  .ll-bar .ll-cta-sm { margin-left: 8px; }
}

/* words */
.ll-stage { align-self: end; display: grid; gap: 22px; padding-block: 0 26px; max-width: 760px; }
.ll h1 {
  margin: 0;
  font-family: var(--display);
  font-weight: 400;
  font-size: clamp(46px, 7.4vw, 112px);
  line-height: 0.94;
  letter-spacing: -0.012em;
  text-wrap: balance;
  color: var(--bone);
  text-shadow: 0 2px 30px rgba(12, 3, 11, 0.6);
}
.ll h1 .ll-soft { color: var(--bone-soft); font-style: italic; }
.ll-lede { margin: 0; max-width: 46ch; font-size: clamp(14px, 1.15vw, 16px); line-height: 1.65; color: var(--bone-soft); text-shadow: 0 1px 12px rgba(12, 3, 11, 0.8); }
.ll-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; }
.ll-btn {
  display: inline-flex; align-items: center; gap: 10px;
  height: 48px; padding: 0 22px;
  font: 500 14px/1 var(--mono); letter-spacing: 0.01em;
  text-decoration: none; border-radius: 3px;
  transition: transform 0.25s cubic-bezier(.2,.8,.2,1), background 0.2s, border-color 0.2s, color 0.2s;
}
.ll-btn:active { transform: translateY(1px); }
.ll-btn-main { background: var(--bone); color: var(--plum); }
.ll-btn-main:hover { background: #fff1d6; }
.ll-btn-ghost { color: var(--bone); border: 1px solid var(--line); background: rgba(12, 3, 11, 0.32); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.ll-btn-ghost:hover { border-color: var(--bone-faint); }
.ll-btn .ll-arrow { transition: transform 0.25s cubic-bezier(.2,.8,.2,1); }
.ll-btn-main:hover .ll-arrow { transform: translateX(3px); }

.ll a:focus-visible { outline: 2px solid var(--ember); outline-offset: 3px; }

/* the line along the bottom */
.ll-foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 24px; padding-block: 0 24px; font-size: 12px; color: var(--bone-faint); font-variant-numeric: tabular-nums; }
.ll-foot .ll-live { display: inline-flex; align-items: center; gap: 8px; }
.ll-foot .ll-dot { width: 6px; height: 6px; background: var(--ember); border-radius: 1px; box-shadow: 0 0 10px var(--ember); animation: pulse 2.4s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: 0.45; } }

/* one entrance, after the scene has drawn itself */
.ll-rise { animation: rise 1.1s cubic-bezier(.16,.84,.24,1) both; }
.ll-d1 { animation-delay: 0.9s; } .ll-d2 { animation-delay: 1.05s; } .ll-d3 { animation-delay: 1.2s; } .ll-d4 { animation-delay: 1.35s; }
@keyframes rise { from { opacity: 0; transform: translateY(18px); filter: blur(6px); } }
@media (prefers-reduced-motion: reduce) {
  .ll-rise { animation: none; }
  .ll-foot .ll-dot { animation: none; }
}
@media (max-width: 520px) {
  .ll-foot .ll-credit { display: none; }
}

/* ───────── the rest of the page: type on the night, and two more scenes drawn in characters ───────── */
.ll, .ll *, .ll *::before, .ll *::after { box-sizing: border-box; }
.ll-wrap {
  width: 100%;
  max-width: 1240px;
  margin-inline: auto;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
@media (min-width: 720px) {
  .ll-wrap { padding-left: max(40px, env(safe-area-inset-left, 0px)); padding-right: max(40px, env(safe-area-inset-right, 0px)); }
}
.ll section[id] { scroll-margin-top: 12px; }
.ll h2 {
  margin: 0;
  font-family: var(--display);
  font-weight: 400;
  font-size: clamp(34px, 4.6vw, 64px);
  line-height: 1.02;
  letter-spacing: -0.01em;
  text-wrap: balance;
  color: var(--bone);
}
.ll h3 {
  margin: 0;
  font-family: var(--display);
  font-weight: 400;
  font-size: clamp(24px, 2.2vw, 30px);
  line-height: 1.1;
  color: var(--bone);
}
.ll-body { margin: 0; max-width: 58ch; font-size: 15px; line-height: 1.72; color: var(--bone-soft); }
.ll-small { font-size: 12px; line-height: 1.6; color: var(--bone-faint); font-variant-numeric: tabular-nums; }

/* story: a statement and the facts of the place */
.ll-story { padding-block: clamp(72px, 11vw, 150px) clamp(56px, 8vw, 110px); }
.ll-story .ll-wrap { display: grid; gap: 44px 72px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 900px) { .ll-story .ll-wrap { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: start; } }
.ll-story .ll-say { display: grid; gap: 22px; }
.ll-facts { margin: 6px 0 0; display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 12px 28px; font-size: 14px; }
.ll-facts dt { color: var(--bone-faint); }
.ll-facts dd { margin: 0; color: var(--bone); font-variant-numeric: tabular-nums; }

/* a scene band */
.ll-band { position: relative; isolation: isolate; overflow: hidden; background: var(--night); }
.ll-band canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; z-index: -1; }
.ll-band-deacon {
  width: min(100%, calc(92vh * 1.36));
  margin-inline: auto;
  aspect-ratio: 1024 / 753;
}
.ll-band-gang { width: 100%; aspect-ratio: 1448 / 543; min-height: 320px; }
.ll-cap {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 24px;
  padding-block: 14px 0;
}

/* the world: heading over the Deacon */
.ll-world { padding-block: clamp(40px, 6vw, 80px) clamp(64px, 9vw, 120px); }
.ll-world .ll-head { display: grid; gap: 18px; padding-block: 0 clamp(28px, 4vw, 48px); }
@media (min-width: 900px) { .ll-world .ll-head { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: end; gap: 72px; } }

/* the gang: names on the figures and in a row below */
.ll-gang { padding-block: clamp(40px, 6vw, 80px) clamp(64px, 9vw, 120px); }
.ll-gang .ll-head { display: grid; gap: 18px; padding-block: 0 clamp(28px, 4vw, 48px); }
@media (min-width: 900px) { .ll-gang .ll-head { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: end; gap: 72px; } }
.ll-who {
  position: absolute; z-index: 2;
  width: 64px; height: 64px; margin: -32px 0 0 -32px;
  padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer;
}
.ll-who::after {
  content: ""; position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; margin: -3px 0 0 -3px;
  border-radius: 50%; background: var(--bone); box-shadow: 0 0 0 3px rgba(12, 3, 11, 0.5), 0 0 12px rgba(255, 170, 90, 0.55);
  opacity: 0.7; transition: transform 0.3s cubic-bezier(.2,.8,.2,1), opacity 0.2s;
}
.ll-who:hover::after, .ll-who:focus-visible::after, .ll-who.ll-on::after { transform: scale(1.4); opacity: 1; }
.ll-who:focus-visible { outline: 2px solid var(--ember); outline-offset: 2px; }
.ll-tag {
  position: absolute; z-index: 3; pointer-events: none;
  min-width: 180px; max-width: 240px; padding: 12px 14px 13px;
  background: rgba(12, 3, 11, 0.86); border: 1px solid var(--line); border-radius: 3px;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  transform: translate(-50%, calc(-100% - 22px)); opacity: 0;
  transition: opacity 0.2s;
}
.ll-tag.ll-on { opacity: 1; }
.ll-tag b { display: block; font-family: var(--display); font-weight: 400; font-size: 20px; line-height: 1.15; color: var(--bone); }
.ll-tag span { display: block; margin-top: 4px; font-size: 12px; line-height: 1.55; color: var(--bone-soft); }
.ll-roster {
  list-style: none; margin: 0; padding: 22px 0 0;
  display: grid; gap: 14px 20px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
.ll-roster button {
  width: 100%; padding: 12px 0 0; text-align: left; cursor: pointer;
  font: inherit; color: inherit; background: none; border: 0; border-top: 1px solid var(--line);
  transition: border-color 0.2s;
}
.ll-roster button:hover, .ll-roster button:focus-visible, .ll-roster button.ll-on { border-top-color: var(--ember); }
.ll-roster button:focus-visible { outline: 2px solid var(--ember); outline-offset: 4px; }
.ll-roster b { display: block; font-family: var(--display); font-weight: 400; font-size: 21px; line-height: 1.15; color: var(--bone); }
.ll-roster span { display: block; margin-top: 4px; font-size: 12px; color: var(--bone-faint); }

/* how the summer is spent */
.ll-ways { padding-block: clamp(56px, 8vw, 110px); border-top: 1px solid rgba(246, 220, 176, 0.12); }
.ll-ways .ll-wrap { display: grid; gap: 40px; }
.ll-ways ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 40px 64px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 760px) { .ll-ways ul { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ll-ways li { display: grid; gap: 12px; align-content: start; }

/* the last call */
.ll-last { padding-block: clamp(72px, 11vw, 150px); text-align: left; }
.ll-last .ll-wrap { display: grid; gap: 26px; }
.ll-last h2 { font-size: clamp(40px, 6.4vw, 96px); max-width: 14ch; }

.ll-site-foot { padding-block: 28px 36px; border-top: 1px solid rgba(246, 220, 176, 0.12); }
.ll-site-foot .ll-wrap { display: flex; flex-wrap: wrap; gap: 14px 32px; justify-content: space-between; align-items: center; }
.ll-site-foot nav { display: flex; flex-wrap: wrap; gap: 10px 22px; }
.ll-site-foot a { color: var(--bone-soft); text-decoration: none; font-size: 13px; }
.ll-site-foot a:hover { color: var(--bone); }
.ll button:focus-visible { outline: 2px solid var(--ember); outline-offset: 3px; }
`;
