"use client";

/**
 * Nimbus: a marketing page for a weather app, in the style of an Apple product page. A live sky (clouds,
 * sun, rain, snow, lightning, and a real star map with a moon and shooting stars at night) fills the hero and
 * is switchable; below it a phone shows the same sky, a pinned feature tour swaps the phone's screens as you
 * scroll, an animated radar can be played and scrubbed, and a row of widgets slides past sideways.
 *
 * Self-contained: it uses only React, Framer Motion and the files in `./nimbus`. There are no web fonts and
 * no remote images or icons. The page is light; everything is scoped under `#nimbus-root` with hard-coded
 * colours, so it looks the same inside a dark-mode host.
 *
 * Where things live (all under ./nimbus):
 *   theme.ts       colours, easing, font stack and the scoped CSS
 *   weather.ts     the five skies and the sample forecast numbers
 *   sky/           the canvas sky engine (clouds, night sky, rain, snow, lightning)
 *   screens/       what appears on the phones
 *   data/          star catalogue, Milky Way outlines and the radar's land mask
 *   assets.ts      embedded phone bodies and moon textures
 * and one file per page section (hero, phone-stage, statement, features, radar, details, widgets, pricing, closing, footer).
 *
 * Nimbus, "Nimbus Weather Ltd." and every number in the app screens are invented sample content.
 */
import { useRef } from "react";
import { MotionConfig, useInView } from "framer-motion";
import { Closing } from "./nimbus/closing";
import { Details } from "./nimbus/details";
import { Features } from "./nimbus/features";
import { Footer } from "./nimbus/footer";
import { Hero } from "./nimbus/hero";
import { NavBar } from "./nimbus/nav";
import { PhoneStage } from "./nimbus/phone-stage";
import { Pricing } from "./nimbus/pricing";
import { Radar } from "./nimbus/radar";
import { Statement } from "./nimbus/statement";
import { NIMBUS_CSS } from "./nimbus/theme";
import { Widgets } from "./nimbus/widgets";

export function NimbusPage() {
  const heroRef = useRef<HTMLElement>(null);
  // The nav is dark and translucent while the hero's sky is behind it, and frosted white after that.
  const heroInView = useInView(heroRef, { amount: 0.3 });

  return (
    <MotionConfig reducedMotion="user">
      <style>{NIMBUS_CSS}</style>
      <div id="nimbus-root" className="min-h-screen">
        <NavBar onSky={heroInView} />
        <main>
          <Hero sectionRef={heroRef} inView={heroInView} />
          <Statement />
          <PhoneStage />
          <Features />
          <Radar />
          <Details />
          <Widgets />
          <Pricing />
          <Closing />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
