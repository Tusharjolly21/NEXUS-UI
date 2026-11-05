/**
 * Styles Tailwind cannot express: the colour tokens for both themes, the font stacks, the hatched side rails, the
 * shared "pill" surface, the focus ring and two keyframe loops.
 *
 * Theme: the tokens below belong to `#margin-root`. Dark applies when <html> has the class `dark`, or, when <html>
 * has neither `dark` nor `light`, when the visitor's system is set to dark. Every colour on the page is one of
 * these variables, so retheming means editing this block only.
 *
 * Fonts: nothing is downloaded. The page is designed with Cabinet Grotesk (headings) and Satoshi (text), with
 * Bricolage Grotesque and DM Sans as stand-ins. They are used if they are installed or loaded by your app;
 * otherwise the system stack applies. Change `--margin-display` and `--margin-text` to use other fonts.
 */

const LIGHT = `--page:#f4f4f5;--col:#fcfcfc;--card:#ffffff;--fg:#121214;--fg2:rgba(18,18,20,.74);--dim:rgba(18,18,20,.55);--faint:rgba(18,18,20,.38);--line:rgba(0,0,0,.07);--chip:rgba(0,0,0,.04);--chip2:rgba(0,0,0,.065);--accent:#2563eb;--hatch:rgba(0,0,0,.07);--shadow:0 0 0 1px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.05),0 6px 16px -10px rgba(0,0,0,.18);--c0:rgba(0,0,0,.06);--c1:#c3ead0;--c2:#86d6a2;--c3:#3fb46c;--c4:#1d7a43;color-scheme:light`;

const DARK = `--page:#000;--col:#060607;--card:#101012;--fg:#f4f4f5;--fg2:rgba(244,244,245,.76);--dim:rgba(244,244,245,.56);--faint:rgba(244,244,245,.38);--line:rgba(255,255,255,.08);--chip:rgba(255,255,255,.06);--chip2:rgba(255,255,255,.09);--accent:#6b9bff;--hatch:rgba(255,255,255,.08);--shadow:0 0 0 1px rgba(255,255,255,.08),0 1px 2px rgba(0,0,0,.5),0 6px 16px -10px rgba(0,0,0,.8);--c0:rgba(255,255,255,.06);--c1:#0f3d22;--c2:#166b3a;--c3:#22a257;--c4:#4ade80;color-scheme:dark`;

export const BASE_CSS = `
@layer base {
:where(#margin-root) *,:where(#margin-root) *::before,:where(#margin-root) *::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:rgba(127,127,127,.2)}
:where(#margin-root) h1,:where(#margin-root) h2,:where(#margin-root) h3,:where(#margin-root) p,:where(#margin-root) ul,:where(#margin-root) li{margin:0}
:where(#margin-root) ul{padding:0;list-style:none}
:where(#margin-root) button{font:inherit;color:inherit;background:none;padding:0;cursor:pointer}
:where(#margin-root) a{color:inherit;text-decoration:none}
:where(#margin-root) img,:where(#margin-root) svg{display:block;max-width:100%}
}
html{background:#f4f4f5}
html.dark{background:#000}
@media (prefers-color-scheme:dark){html:not(.light):not(.dark){background:#000}}
body{margin:0}
#margin-root{--margin-display:'Cabinet Grotesk','Bricolage Grotesque','Avenir Next','Segoe UI Variable Display',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;--margin-text:'Satoshi','DM Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;${LIGHT};background:var(--page);color:var(--fg);font-family:var(--margin-text);font-size:14px;line-height:1.5;min-height:100vh;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-text-size-adjust:100%}
html.dark #margin-root{${DARK}}
@media (prefers-color-scheme:dark){html:not(.light):not(.dark) #margin-root{${DARK}}}
#margin-root ::selection{background:color-mix(in srgb,var(--accent) 22%,transparent)}
#margin-root .margin-rail{background-image:repeating-linear-gradient(-45deg,var(--hatch) 0 1px,transparent 1px 7px)}
#margin-root .margin-pill{background:var(--card);box-shadow:var(--shadow);color:var(--fg)}
#margin-root .margin-ring:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@keyframes margin-marquee{to{transform:translateX(-50%)}}
@keyframes margin-pulse{0%{transform:scale(1);opacity:.55}100%{transform:scale(2.6);opacity:0}}
#margin-root .margin-marquee{animation:margin-marquee 38s linear infinite}
#margin-root .margin-marquee-wrap:hover .margin-marquee{animation-play-state:paused}
#margin-root .margin-pulse{animation:margin-pulse 2s ease-out infinite}
@media (prefers-reduced-motion:reduce){#margin-root .margin-marquee,#margin-root .margin-pulse{animation:none}}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
`;
