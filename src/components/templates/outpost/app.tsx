"use client";

import { Builder } from "./builder";
import { Cta, Footer } from "./cta";
import { Developers } from "./developers";
import { Hero } from "./hero";
import { Models } from "./models";
import { Nav } from "./nav";
import { Network } from "./network";
import { Pricing } from "./pricing";
import { Product } from "./product";
import { BASE_CSS, DARK, FONT_CSS, FONT_SANS } from "./theme";

/**
 * Outpost: night-sky dark, with a dusk desert landscape behind the hero and the call to action. Sections: nav, hero
 * with a live inference console, product features, a drag-and-wire endpoint builder, the global dot-map network,
 * developer snippets, the model catalog, pricing, a call to action and the footer.
 */
export function OutpostApp() {
  return (
    <div
      className="op min-h-screen overflow-x-clip"
      style={{
        background: DARK.bg,
        color: DARK.ink,
        fontFamily: FONT_SANS,
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      <Nav />
      <main>
        <Hero />
        <Product />
        <Builder />
        <Network />
        <Developers />
        <Models />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
