"use client";

import { Answers } from "./answers";
import { Cta, Footer } from "./cta";
import { Customers } from "./customers";
import { Faq } from "./faq";
import { Features } from "./features";
import { CustomerStrip, Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Levels } from "./levels";
import { Loop } from "./loop";
import { Nav } from "./nav";
import { Pricing } from "./pricing";
import { BASE_CSS, COLORS, FONT_CSS, FONT_SANS } from "./theme";

/**
 * Surfaced: near-black with an indigo accent. Sections: nav, hero with a live assistant check, customers, an answers
 * carousel, features, how it works, levels, the daily loop, customers, pricing, FAQ, a call to action and the footer.
 */
export function SurfacedApp() {
  return (
    <div
      className="sf min-h-screen overflow-x-clip antialiased"
      style={{
        fontFamily: FONT_SANS,
        background: COLORS.bg,
        color: COLORS.ink,
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      <Nav />
      <main>
        <Hero />
        <CustomerStrip />
        <Answers />
        <Features />
        <HowItWorks />
        <Levels />
        <Loop />
        <Customers />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
