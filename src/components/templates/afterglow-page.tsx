"use client";

import { MotionConfig } from "framer-motion";
import { Nav } from "./afterglow/nav";
import { Hero, CustomerStrip } from "./afterglow/hero";
import { HowItWorks } from "./afterglow/how-it-works";
import { Product } from "./afterglow/product";
import { Trail } from "./afterglow/trail";
import { Customers } from "./afterglow/customers";
import { Pricing } from "./afterglow/pricing";
import { FaqSection } from "./afterglow/faq";
import { FinalCta, Footer } from "./afterglow/closing";

const BASE_CSS = `
@layer base {
html { background: #000; scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; background: #000; }
#afterglow-root { background: #000; color: #f3efe9; font-family: "Onest", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
:where(#afterglow-root) *, :where(#afterglow-root) *::before, :where(#afterglow-root) *::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: rgba(255,255,255,.08); }
:where(#afterglow-root) h1, :where(#afterglow-root) h2, :where(#afterglow-root) h3, :where(#afterglow-root) p, :where(#afterglow-root) ul, :where(#afterglow-root) ol, :where(#afterglow-root) dl, :where(#afterglow-root) dd, :where(#afterglow-root) figure, :where(#afterglow-root) blockquote { margin: 0; }
:where(#afterglow-root) ul, :where(#afterglow-root) ol { padding: 0; list-style: none; }
:where(#afterglow-root) button { font: inherit; color: inherit; background: none; cursor: pointer; padding: 0; }
:where(#afterglow-root) a { color: inherit; text-decoration: none; }
:where(#afterglow-root) svg { display: inline-block; }
:where(#afterglow-root) ::selection { background: rgba(255,122,47,.35); color: #fff; }
}
`;

export function AfterglowPage() {
  return (
    <MotionConfig reducedMotion="user">
      <style>{BASE_CSS}</style>
      <div id="afterglow-root" className="min-h-screen overflow-x-clip">
      <a
        href="#product"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#f3efe9] focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <CustomerStrip />
        <HowItWorks />
        <Product />
        <Trail />
        <Customers />
        <Pricing />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
      </div>
    </MotionConfig>
  );
}
