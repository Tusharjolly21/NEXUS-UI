"use client";

/**
 * The page render.mjs captures: it draws one video full-window and lets the script set the clock.
 * Put it at a route such as app/video-frame/page.tsx and swap LaunchReel for the video you want.
 */
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import LaunchReel from "./launch-reel";
import { H, W } from "./kit";

declare global {
  interface Window {
    __setT?: (t: number) => void;
    __videoReady?: boolean;
  }
}

export default function VideoFrame() {
  const [t, setT] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(window.innerWidth / W);
    fit();
    window.addEventListener("resize", fit);
    window.__setT = (x) => flushSync(() => setT(x));
    window.__videoReady = true;
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#000" }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <LaunchReel t={t} />
      </div>
    </div>
  );
}
