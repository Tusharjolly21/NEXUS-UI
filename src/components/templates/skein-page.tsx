"use client";

import { MotionConfig } from "framer-motion";
import { Nav } from "./skein/nav";
import { Hero } from "./skein/hero";
import { AskSection } from "./skein/ask";
import { Product } from "./skein/product";
import { Integrations } from "./skein/integrations";
import { Customers } from "./skein/customers";
import { Stats } from "./skein/stats";
import { Faq } from "./skein/faq";
import { Cta } from "./skein/cta";
import { Footer } from "./skein/footer";

/**
 * Theme tokens are space-separated RGB triplets so utilities can add alpha:
 * `text-[rgb(var(--skein-ink)/.8)]`. Dark is the page's home look; light is the default until the `dark` class is on
 * <html>, which the template's own toggle (and the Nexus preview switch) sets. The toggle saves the choice under
 * `skein-theme`; to apply it before first paint in your own app, read that key in an inline script in <head> and
 * add the `dark` class.
 *
 * Fonts: the page is designed with Geist Sans, Geist Mono and Bricolage Grotesque. Nothing is downloaded: it reads
 * `--font-geist-sans` and `--font-bricolage` if your app defines them (for example with next/font) and otherwise
 * uses the system stack.
 */
const BASE_CSS = `
:root{--skein-bg:248 247 245;--skein-panel:255 255 255;--skein-raised:240 239 236;--skein-ink:23 21 19;--skein-mute:87 83 78;--skein-faint:113 107 101;--skein-line:23 21 19;--skein-live:21 128 61;--skein-warn:180 83 9;--skein-crit:220 38 38;--skein-info:37 99 235;--skein-btn:23 21 19;--skein-btn-ink:250 250 249;color-scheme:light}
.dark{--skein-bg:16 15 13;--skein-panel:23 21 19;--skein-raised:33 31 28;--skein-ink:250 250 249;--skein-mute:168 162 158;--skein-faint:136 129 123;--skein-line:250 250 249;--skein-live:74 222 128;--skein-warn:251 191 36;--skein-crit:248 113 113;--skein-info:96 165 250;--skein-btn:250 250 249;--skein-btn-ink:28 25 23;color-scheme:dark}
html{background:rgb(var(--skein-bg));scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:rgb(var(--skein-bg))}
#skein-root{background:rgb(var(--skein-bg));color:rgb(var(--skein-ink));font-family:var(--font-geist-sans),-apple-system,BlinkMacSystemFont,"SF Pro Text",ui-sans-serif,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
:where(#skein-root) *,:where(#skein-root) *::before,:where(#skein-root) *::after{border-color:rgb(var(--skein-line)/.1)}
:where(#skein-root) button,:where(#skein-root) [role=button]{cursor:pointer}
:where(#skein-root) ::selection{background:rgb(var(--skein-ink)/.18)}
#skein-root :focus-visible{outline:2px solid rgb(var(--skein-info));outline-offset:2px}
::view-transition-old(root),::view-transition-new(root){animation-duration:.35s}
.skein-display{font-family:var(--font-bricolage),var(--font-geist-sans),-apple-system,BlinkMacSystemFont,"SF Pro Display",ui-sans-serif,system-ui,sans-serif}
.skein-tnum{font-variant-numeric:tabular-nums}
.skein-hue{color:#ff6b6b;animation:skein-hue 5s linear infinite}
.skein-shimmer{background:linear-gradient(90deg,rgb(var(--skein-mute)),rgb(var(--skein-mute)) 30%,#ff6b6b 40%,#ffc36b,#6be3a1,#63b3ff,#b08cff 64%,rgb(var(--skein-mute)) 74%,rgb(var(--skein-mute)));background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:skein-shimmer 2.2s linear infinite}
.skein-marquee-x{animation:skein-marquee-x var(--duration,40s) linear infinite}
.skein-marquee-y{animation:skein-marquee-y var(--duration,30s) linear infinite}
.skein-marquee-x:hover,.skein-marquee-y:hover{animation-play-state:paused}
@keyframes skein-hue{to{filter:hue-rotate(360deg)}}
@keyframes skein-shimmer{0%{background-position:100% 0}to{background-position:0% 0}}
@keyframes skein-marquee-x{to{transform:translate(-50%)}}
@keyframes skein-marquee-y{to{transform:translateY(-50%)}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.skein-hue,.skein-marquee-x,.skein-marquee-y{animation:none}.skein-shimmer{animation:none;background:none;color:rgb(var(--skein-mute))}}
`;

export function SkeinPage() {
  return (
    <MotionConfig reducedMotion="user">
      <style>{BASE_CSS}</style>
      <div id="skein-root" className="min-h-screen overflow-x-clip">
        <Nav />
        <main>
          <Hero />
          <AskSection />
          <Product />
          <Integrations />
          <Customers />
          <Stats />
          <Faq />
          <Cta />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
