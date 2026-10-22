"use client";

/**
 * The page render.mjs captures: it draws one video full-window and lets the script set the clock.
 * Put it at a route such as app/video-frame/page.tsx and swap LaunchReel for the video you want.
 * Videos made for one shape ignore the w and h props; the others lay themselves out for them.
 */
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import LaunchReel from "./launch-reel";
import { FORMATS, type FormatId } from "./kit";

declare global {
  interface Window {
    __setT?: (t: number) => void;
    __videoReady?: boolean;
  }
}

export default function VideoFrame() {
  const [t, setT] = useState(0);
  const [scale, setScale] = useState(1);
  // render.mjs adds ?f=16:9 (or 1:1, 9:16, ...) so the page draws the video in the shape being rendered.
  const [format] = useState<FormatId>(() => {
    const f = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("f");
    return f && f in FORMATS ? (f as FormatId) : "9:16";
  });
  const { w: W, h: H } = FORMATS[format];

  useEffect(() => {
    const fit = () => setScale(window.innerWidth / W);
    fit();
    window.addEventListener("resize", fit);
    window.__setT = (x) => flushSync(() => setT(x));
    window.__videoReady = true;
    return () => window.removeEventListener("resize", fit);
  }, [W]);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#000" }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <LaunchReel t={t} w={W} h={H} />
      </div>
    </div>
  );
}
