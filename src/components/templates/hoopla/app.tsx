"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { About, Crew } from "./about";
import { Cta, FloatingCta } from "./cta";
import { Cursor } from "./cursor";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Nav } from "./nav";
import { Clients, Process } from "./process";
import { Services, Superpowers } from "./services";
import { Testimonials } from "./testimonials";
import { BASE_CSS, FONT_CSS, FONT_SANS, INK } from "./theme";
import { ClipDefs, ScallopEdge } from "./ui";
import { Results, WhyUs } from "./why-us";
import { Work } from "./work";
/**
 * Hoopla: sky blue, white and ink, with stickers everywhere. The page opens with a short sticker intro (skipped with
 * reduced motion); the logo replays it.
 */
export function HooplaApp() {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    // the intro plays (again) whenever `replay` changes, with the page locked until it ends
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(false);
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const timer = window.setTimeout(
      () => {
        setReady(true);
        root.style.overflow = "";
      },
      reduce ? 0 : 3100,
    );
    return () => {
      window.clearTimeout(timer);
      root.style.overflow = "";
    };
  }, [replay, reduce]);
  const restart = () => {
    window.scrollTo({
      top: 0,
    });
    setReplay((prev) => prev + 1);
  };
  return (
    <div
      className="hp hp-cursor min-h-screen antialiased"
      style={{
        background: "#fff",
        color: INK,
        fontFamily: FONT_SANS,
        overflowX: "clip",
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      <ClipDefs />
      <Cursor />
      <Nav ready={ready} onLogo={restart} />
      <main>
        <div className="relative">
          <Hero ready={ready} key={replay} />
          <div className="relative z-10">
            <div aria-hidden={true} className="pointer-events-none h-[14svh]" />
            <ScallopEdge />
            <About />
          </div>
        </div>
        <Crew />
        <Work />
        <Services />
        <Superpowers />
        <Process />
        <Clients />
        <WhyUs />
        <Results />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
      <FloatingCta />
    </div>
  );
}
