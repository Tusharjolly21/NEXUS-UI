"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { PieceStack } from "./hero-tiles-frame";

// The live components are a separate download, fetched only where the tiles are shown (desktop), after the page itself.
const HeroTilesLive = dynamic(() => import("./hero-tiles-live"), { ssr: false, loading: () => <PieceStack /> });

/**
 * The hero's right side: six real components, whole, in two columns. Below 1024px the hero doesn't show them, so nothing is
 * downloaded or mounted there. The frames are on the page from the start, so the layout is final before the
 * components arrive.
 */
export function HeroTiles() {
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide ? <HeroTilesLive /> : <PieceStack />;
}
