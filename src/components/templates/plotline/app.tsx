"use client";

import { Changelog } from "./changelog";
import { Cta } from "./cta";
import { Customers, Quote } from "./customers";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Nav } from "./nav";
import { Pricing } from "./pricing";
import { LogoWall, Stats } from "./proof";
import { BASE_CSS, COLOR, FONT_CSS, FONT_SANS } from "./theme";
import { WeeklyUpdates } from "./weekly-updates";
/** Plotline is white with ink type, cool grey hairlines and one cobalt accent; the mocks sit on painted skies. */
export function PlotlineApp() {
  return (
    <div
      className="pl min-h-screen antialiased"
      style={{
        background: "#fff",
        color: COLOR.ink,
        fontFamily: FONT_SANS,
        overflowX: "clip",
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      <Nav />
      <main>
        <Hero />
        <LogoWall />
        <HowItWorks />
        <Stats />
        <WeeklyUpdates />
        <Customers />
        <Quote />
        <Pricing />
        <Faq />
        <Changelog />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
