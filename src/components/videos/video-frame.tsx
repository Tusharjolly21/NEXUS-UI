"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { VIDEO_HEIGHT, VIDEO_WIDTH } from "@/lib/catalog/videos";
import { VIDEO_COMPONENTS } from "./registry";

declare global {
  interface Window {
    __setT?: (t: number) => void;
    __videoReady?: boolean;
  }
}

function Ready() {
  React.useEffect(() => {
    window.__videoReady = true;
  }, []);
  return null;
}

/**
 * One video drawn full-window with its clock set from outside (`window.__setT(seconds)`). It is
 * what `render.mjs` photographs frame by frame, and what the grid previews are rendered from.
 */
export function VideoFrame({ slug, values }: { slug: string; values?: Record<string, unknown> }) {
  const [t, setT] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const Comp = VIDEO_COMPONENTS[slug];
  const known = slug in VIDEO_COMPONENTS;

  React.useEffect(() => {
    const fit = () => setScale(window.innerWidth / VIDEO_WIDTH);
    fit();
    window.addEventListener("resize", fit);
    window.__setT = (x) => flushSync(() => setT(x));
    return () => window.removeEventListener("resize", fit);
  }, []);

  if (!known) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2147483647, overflow: "hidden", background: "#000" }}>
      <div style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <React.Suspense fallback={null}>
          <Comp t={t} {...values} />
          <Ready />
        </React.Suspense>
      </div>
    </div>
  );
}
