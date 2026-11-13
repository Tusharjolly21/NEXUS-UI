"use client";

import * as React from "react";
import { DynamicPreview, PreviewGuard } from "@/components/library/dynamic-preview";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";
import { cn } from "@/lib/utils";
import { scheduleWebGLSweep, watchWebGL } from "./webgl-release";

/** Classes that make a preview's root fill the canvas it is rendered on (shared with the tile lab). */
export const PREVIEW_FILL_CLASSES =
  "flex items-center justify-center [&>*]:!h-full [&>*]:!min-h-full [&>*]:!w-full [&>*]:!max-w-none";

export type Rect = readonly [x: number, y: number, w: number, h: number];

/**
 * Renders a live preview on a fixed `canvas` and frames it on `focus` — the part of the canvas the
 * component actually occupies — so the component fills its tile at its own proportions instead of
 * being lost in an oversized stage or cropped by a generic one.
 */
export function FitPreview({
  exportName,
  canvas,
  focus,
  eager = false,
  demo,
  maxScale = 1,
  className,
}: {
  exportName: string;
  canvas: readonly [w: number, h: number];
  focus: Rect;
  /** Mount on the first render (no wait for the observer), for tiles that start on screen. */
  eager?: boolean;
  /** Ghost-cursor script (fractions of the canvas) that demonstrates the component. */
  demo?: DemoStep[];
  /** Largest zoom applied to the component (1 = its real size). */
  maxScale?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [box, setBox] = React.useState<{ w: number; h: number } | null>(null);
  const [near, setNear] = React.useState(eager);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setBox({ w: node.clientWidth || 1, h: node.clientHeight || 1 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Mount near the viewport and unmount once well away from it, so scrolling a long wall never
    // leaves hundreds of animated previews running at the same time.
    // On a phone the window is smaller, so the margin is too: fewer previews alive at once where memory is tightest.
    watchWebGL();
    const margin = window.matchMedia("(max-width: 639px)").matches ? "300px" : "500px";
    const io = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting);
        // one that just left gives its GPU context back; one that just arrived is noted as on the page
        scheduleWebGLSweep(entry.isIntersecting ? 1500 : 400);
      },
      { rootMargin: margin },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      scheduleWebGLSweep();
    };
  }, []);

  const [cw, ch] = canvas;
  const [fx, fy, fw, fh] = focus;
  let transform = "scale(0)";
  if (box) {
    // never magnify: a small component sits at its real size with room around it
    const s = Math.min(box.w / fw, box.h / fh, maxScale);
    const tx = box.w / 2 - (fx + fw / 2) * s;
    const ty = box.h / 2 - (fy + fh / 2) * s;
    transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        className={cn("absolute left-0 top-0 origin-top-left", PREVIEW_FILL_CLASSES)}
        style={{ width: cw, height: ch, transform, visibility: box ? "visible" : "hidden" }}
      >
        {/* the guard stays while the preview comes and goes, so an error on the way out stays in this frame */}
        <PreviewGuard name={exportName} resetKey={near}>
          {near ? <DynamicPreview exportName={exportName} compact /> : null}
          {near && demo ? <DemoCursor script={demo} startDelay={1200} /> : null}
        </PreviewGuard>
      </div>
    </div>
  );
}

/** A ghost-cursor script that stays inside `focus` (canvas px), as canvas fractions. */
export function demoScript(kind: "wander" | "drag", canvas: readonly [number, number], focus: Rect): DemoStep[] {
  const [cw, ch] = canvas;
  const [fx, fy, fw, fh] = focus;
  const at = (u: number, v: number) => ({ x: (fx + fw * u) / cw, y: (fy + fh * v) / ch });
  if (kind === "drag") {
    return [
      { ...at(0.5, 0.5), ms: 700, wait: 250 },
      { action: "down", wait: 120 },
      { ...at(0.22, 0.52), ms: 900 },
      { ...at(0.78, 0.5), ms: 1300 },
      { ...at(0.5, 0.5), ms: 800, wait: 120 },
      { action: "up", wait: 900 },
    ];
  }
  return [
    { ...at(0.3, 0.38), ms: 800, wait: 200 },
    { ...at(0.68, 0.32), ms: 1100, wait: 150 },
    { ...at(0.74, 0.66), ms: 1000, wait: 200 },
    { ...at(0.36, 0.7), ms: 1100, wait: 150 },
    { ...at(0.5, 0.5), ms: 900, wait: 600 },
    { ...at(1.08, 0.9), ms: 900, wait: 300 },
  ];
}
