"use client";

/**
 * Motion Kit previews (batch 20): Molten Hold, Mercury Switch, Mercury Upload. Each plays itself (autoplay) until a real
 * pointer arrives, shown as a magnified close-up of the component so the metal can be seen at work.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoltenHold } from "@/components/molten-hold";
import { MercurySwitch } from "@/components/mercury-switch";
import { MercuryUpload } from "@/components/mercury-upload";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

/**
 * Shows a component magnified: it is laid out at its own size (`w` by `h`) and scaled as a whole to `want`, or smaller
 * where the stage is narrow. The shaders read the scale from the page, so the metal is drawn sharp at that size.
 */
function Magnified({ w, h, want, compact, children }: { w: number; h: number; want: number; compact: boolean; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(want);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.max(0.5, Math.min(want, el.clientWidth / w)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [want, w]);
  return (
    <div className={`${STAGE} ${compact ? "min-h-[300px]" : "min-h-[400px]"}`}>
      <div ref={box} className="flex w-full justify-center">
        <div style={{ width: w * scale, height: h * scale }}>
          <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "0 0" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Molten Hold up close: the bar being held, the glowing front running along it and cooling to chrome behind. */
export function PreviewMoltenHold({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Magnified w={400} h={200} want={compact ? 1.2 : 1.5} compact={compact}>
      <MoltenHold autoplay />
    </Magnified>
  );
}

/** Mercury Switch up close: the beads reaching across their grooves, with the groove glowing when it is on. */
export function PreviewMercurySwitch({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Magnified w={400} h={228} want={compact ? 1.2 : 1.5} compact={compact}>
      <MercurySwitch autoplay />
    </Magnified>
  );
}

/** Mercury Upload up close: drops falling from the file into the pool, then the pool pulling into a single bead. */
export function PreviewMercuryUpload({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Magnified w={400} h={240} want={compact ? 1.2 : 1.5} compact={compact}>
      <MercuryUpload autoplay />
    </Magnified>
  );
}
