"use client";

import { AppWindow } from "./app-window";
import { Cta, Footer } from "./cta";
import { CustomerStrip } from "./customer-strip";
import { Customers } from "./customers";
import { Faq } from "./faq";
import { Features } from "./features";
import { Hero } from "./hero";
import { Nav } from "./nav";
import { Pricing } from "./pricing";
import { Security } from "./security";
import { BASE_CSS, COLORS, FONT_CSS, FONT_SANS } from "./theme";
import { WakeUp } from "./wake-up";

export function NightwatchApp() {
  return (
    <div
      className="nw min-h-screen overflow-x-clip antialiased"
      style={{
        fontFamily: FONT_SANS,
        color: COLORS.ink,
        background: COLORS.night,
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      <Nav />
      <main>
        <Hero />
        <AppWindow />
        <CustomerStrip />
        <Features />
        <Customers />
        <WakeUp />
        <Security />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
