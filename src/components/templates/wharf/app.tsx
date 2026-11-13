"use client";

import { Cta } from "./cta";
import { Customers, Testimonial } from "./customers";
import { Developers } from "./developers";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Nav } from "./nav";
import { Rails } from "./rails";
import { Security } from "./security";
import { BASE_CSS, COLOR, FONT_CSS, FONT_SANS } from "./theme";
import { SvgDefs } from "./ui";
export function WharfApp() {
  return (
    <div
      className="wf min-h-screen antialiased"
      style={{
        background: COLOR.bg,
        color: COLOR.ink,
        fontFamily: FONT_SANS,
        overflowX: "clip",
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      <SvgDefs />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Rails />
        <Customers />
        <Developers />
        <Testimonial />
        <Security />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
