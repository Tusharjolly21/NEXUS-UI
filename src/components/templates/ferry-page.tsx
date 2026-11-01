"use client";

import { MotionConfig } from "framer-motion";
import { Nav } from "./ferry/nav";
import { Hero } from "./ferry/hero";
import { Treasury } from "./ferry/treasury";
import { Product } from "./ferry/product";
import { Payouts } from "./ferry/payouts";
import { Controls } from "./ferry/controls";
import { Developers } from "./ferry/developers";
import { Customers } from "./ferry/customers";
import { Pricing } from "./ferry/pricing";
import { Faq } from "./ferry/faq";
import { Footer } from "./ferry/footer";

/**
 * Theme tokens are space-separated RGB triplets so utilities can add alpha:
 * `bg-[rgb(var(--ferry-accent)/.1)]`. Light is the default; the `dark` class on <html> switches the set.
 * The template's own toggle saves the choice under `ferry-theme`; to apply it before first paint in your
 * own app, read that key in an inline script in <head> and add the `dark` class.
 */
const BASE_CSS = `
:root{--ferry-paper:255 255 255;--ferry-frame:248 250 255;--ferry-surface:255 255 255;--ferry-raised:245 246 248;--ferry-ink:10 10 10;--ferry-mute:82 82 91;--ferry-faint:113 113 122;--ferry-line:10 10 10;--ferry-accent:39 103 255;--ferry-accent-ink:29 84 216;--ferry-gain:31 136 61;--ferry-loss:220 38 38;--ferry-amber:161 98 7;--ferry-glow:.1;--ferry-card-shadow:0 0 0 1px rgb(10 10 10/.06),0 20px 40px -26px rgb(0 0 0/.3);--ferry-lift-shadow:0 0 0 1px rgb(10 10 10/.05),0 30px 60px -22px rgb(0 0 0/.32);--ferry-panel-shadow:0 22px 70px -58px rgb(0 0 0/.34);color-scheme:light}
.dark{--ferry-paper:0 0 0;--ferry-frame:7 8 11;--ferry-surface:3 3 5;--ferry-raised:17 17 21;--ferry-ink:255 255 255;--ferry-mute:161 161 170;--ferry-faint:113 113 122;--ferry-line:255 255 255;--ferry-accent:39 103 255;--ferry-accent-ink:141 176 255;--ferry-gain:74 222 128;--ferry-loss:248 113 113;--ferry-amber:245 182 66;--ferry-glow:.32;--ferry-card-shadow:0 0 0 1px rgb(255 255 255/.09);--ferry-lift-shadow:0 0 0 1px rgb(255 255 255/.1),0 30px 60px -22px rgb(0 0 0/.85);--ferry-panel-shadow:0 0 0 0 transparent;color-scheme:dark}
html{background:rgb(var(--ferry-paper));scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:rgb(var(--ferry-paper))}
#ferry-root{background:rgb(var(--ferry-paper));color:rgb(var(--ferry-ink));font-family:var(--font-inter),Inter,-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
:where(#ferry-root) *,:where(#ferry-root) *::before,:where(#ferry-root) *::after{border-color:rgb(var(--ferry-line)/.1)}
:where(#ferry-root) button,:where(#ferry-root) [role=button]{cursor:pointer}
:where(#ferry-root) ::selection{background:rgb(var(--ferry-accent)/.22)}
#ferry-root :focus-visible{outline:2px solid rgb(var(--ferry-accent));outline-offset:2px}
::view-transition-old(root),::view-transition-new(root){animation-duration:.35s}
.ferry-tnum{font-variant-numeric:tabular-nums}
.ferry-shadow-lift{box-shadow:var(--ferry-lift-shadow)}
.ferry-shadow-panel{box-shadow:var(--ferry-panel-shadow)}
.ferry-range{-webkit-appearance:none;appearance:none;height:28px;background:transparent;cursor:pointer}
.ferry-range::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(to right,rgb(var(--ferry-accent)) var(--fill,50%),rgb(var(--ferry-ink)/.1) var(--fill,50%))}
.ferry-range::-moz-range-track{height:6px;border-radius:999px;background:rgb(var(--ferry-ink)/.1)}
.ferry-range::-moz-range-progress{height:6px;border-radius:999px;background:rgb(var(--ferry-accent))}
.ferry-range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;margin-top:-10px;border-radius:999px;background:#fff;box-shadow:0 0 0 .5px #0000001f,0 3px 8px #0000002e;transition:transform .15s}
.ferry-range::-moz-range-thumb{width:26px;height:26px;border:0;border-radius:999px;background:#fff;box-shadow:0 0 0 .5px #0000001f,0 3px 8px #0000002e}
.ferry-range:active::-webkit-slider-thumb{transform:scale(1.08)}
.ferry-range:focus-visible{outline:none}
.ferry-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px rgb(var(--ferry-accent)/.45),0 3px 8px #0000002e}
.ferry-range:focus-visible::-moz-range-thumb{box-shadow:0 0 0 3px rgb(var(--ferry-accent)/.45),0 3px 8px #0000002e}
.ferry-glow{position:absolute;pointer-events:none;top:-220px;right:-180px;width:460px;height:460px;border-radius:999px;background:radial-gradient(closest-side,rgb(var(--ferry-accent)/var(--ferry-glow)),transparent)}
.ferry-edge{position:absolute;pointer-events:none;top:0;left:18%;right:18%;height:1px;background:linear-gradient(to right,transparent,rgb(var(--ferry-accent)/.55),transparent)}
.ferry-marquee{animation:ferry-marquee var(--marquee-duration,60s) linear infinite}
.ferry-marquee:hover,.ferry-marquee:focus-within{animation-play-state:paused}
@keyframes ferry-marquee{to{transform:translate(-50%)}}
.ferry-travel{offset-anchor:center;offset-rotate:0deg;animation:ferry-travel 2.6s cubic-bezier(.45,0,.55,1) infinite}
@keyframes ferry-travel{0%{offset-distance:0%;opacity:0}12%{opacity:1}88%{opacity:1}to{offset-distance:100%;opacity:0}}
.ferry-no-scrollbar{scrollbar-width:none}
.ferry-no-scrollbar::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ferry-marquee{animation:none}.ferry-travel{animation:none;opacity:0}}
`;

export function FerryPage() {
  return (
    <MotionConfig reducedMotion="user">
      <style>{BASE_CSS}</style>
      <div id="ferry-root" className="min-h-screen overflow-x-clip">
        <Nav />
        <main>
          <Hero />
          <Treasury />
          <Product />
          <Payouts />
          <Controls />
          <Developers />
          <Customers />
          <Pricing />
          <Faq />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
