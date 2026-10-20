"use client";

import * as React from "react";

/**
 * Keeps a live preview inside its frame on narrow screens. Fixed-width components (a 330px
 * panel, a 320px card) used to stretch the frame past the screen edge on phones, where the page
 * clipped them. This renders the preview at the width it needs and scales it down to fit, so the
 * whole component stays visible and usable. At full size (the usual desktop case) nothing changes.
 */
export function FitPreview({ minHeight = 460, children }: { minHeight?: number; children: React.ReactNode }) {
  const outer = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  const [fit, setFit] = React.useState<{ width: number; scale: number; height: number } | null>(null);

  React.useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const avail = o.clientWidth;
        if (!avail) return;
        // Measure the natural width at the frame's own width; anything wider overflows.
        const prevWidth = i.style.width;
        const prevTransform = i.style.transform;
        i.style.width = "100%";
        i.style.transform = "none";
        const need = i.scrollWidth;
        i.style.width = prevWidth;
        i.style.transform = prevTransform;
        if (need <= avail + 1) {
          setFit((f) => (f === null ? f : null));
          return;
        }
        const scale = avail / need;
        setFit({ width: need, scale, height: i.offsetHeight * scale });
      });
    };
    measure();
    // Autoplay demos can open wider a moment after mount; check again once they settle.
    const later = window.setTimeout(measure, 900);
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(later);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={outer} className="relative w-full min-w-0 [contain:inline-size]" style={{ minHeight, height: fit ? Math.max(minHeight, fit.height) : undefined }}>
      <div
        ref={inner}
        // A grid (not a flex row) so a preview's `h-full` resolves against the frame's height and
        // short components sit centred in the frame instead of at its top.
        className="grid [&>*]:w-full"
        style={{
          minHeight: fit ? minHeight / fit.scale : minHeight,
          width: fit ? fit.width : "100%",
          transform: fit ? `scale(${fit.scale})` : undefined,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
