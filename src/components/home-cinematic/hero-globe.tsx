"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// The globe and its land outline are a separate download, fetched only on wide screens and only after the page has loaded.
const HeroGlobeCanvas = dynamic(() => import("./hero-globe-canvas"), { ssr: false });

/** The hero's background globe. Nothing is downloaded or drawn below 1024px. */
export function HeroGlobe() {
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide ? <HeroGlobeCanvas /> : null;
}
