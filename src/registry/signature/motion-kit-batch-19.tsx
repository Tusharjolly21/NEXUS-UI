"use client";

/**
 * Motion Kit previews (batch 19): Mercury Tabs. It plays itself (autoplay) until a real pointer arrives.
 */

import { useEffect, useRef, useState } from "react";
import { MercuryTabs } from "@/components/mercury-tabs";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

// the stage's own size before it is magnified (the bar inside is about 335px wide, 270px on a phone)
const W_WIDE = 420;
const W_NARROW = 320;
const H = 132;

/**
 * Mercury Tabs up close: just the bar, magnified so the liquid chrome can be seen travelling between the tabs, bulging as
 * it lands, lensing the icons it passes over, and spreading the light theme from the sun. The heading is left out. The
 * component is the real one, scaled as a whole; its shader reads the scale, so the metal is drawn sharp at that size.
 * It plays itself, and shrinks to fit a narrow screen.
 */
export function PreviewMercuryTabs({ compact = false }: { compact?: boolean } = {}) {
  const box = useRef<HTMLDivElement>(null);
  const want = compact ? 1.3 : 1.6;
  const [scale, setScale] = useState(want);
  const [W, setW] = useState(W_WIDE);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth < 400 ? W_NARROW : W_WIDE;
      setW(w);
      setScale(Math.max(0.5, Math.min(want, el.clientWidth / w)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [want]);
  return (
    <div className={`${STAGE} ${compact ? "min-h-[300px]" : "min-h-[400px]"}`}>
      <div ref={box} className="flex w-full justify-center">
        <div style={{ width: W * scale, height: H * scale }}>
          <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <MercuryTabs autoplay showHeading={false} className="h-full! w-full! max-w-none!" />
          </div>
        </div>
      </div>
    </div>
  );
}
