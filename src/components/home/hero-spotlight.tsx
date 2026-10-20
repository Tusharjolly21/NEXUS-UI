"use client";

import * as React from "react";

/**
 * Reveals a dot grid in a soft circle around the pointer, over the hero's own (invisible)
 * grid so the dots line up. Fine pointers only; off for reduced motion.
 */
export function HeroSpotlight() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const move = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.opacity = "1";
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      el.style.opacity = "0";
    };

    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pg-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
    />
  );
}
