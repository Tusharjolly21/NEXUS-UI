"use client";

import * as React from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompareProps {
  /** Image src for the left (before) side. */
  beforeImage?: string;
  /** Image src for the right (after) side. */
  afterImage?: string;
  /** Arbitrary content for the left (before) side — overrides beforeImage. */
  beforeContent?: React.ReactNode;
  /** Arbitrary content for the right (after) side — overrides afterImage. */
  afterContent?: React.ReactNode;
  /** Optional label overlaid on the left side. */
  beforeLabel?: string;
  /** Optional label overlaid on the right side. */
  afterLabel?: string;
  /** Initial slider position as a percentage (0–100). @default 50 */
  initialPosition?: number;
  className?: string;
}

export function Compare({
  beforeImage,
  afterImage,
  beforeContent,
  afterContent,
  beforeLabel,
  afterLabel,
  initialPosition = 50,
  className,
}: CompareProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(initialPosition);

  function toPercent(clientX: number): number {
    const el = containerRef.current;
    if (!el) return 50;
    const { left, width } = el.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
  }

  function onMouseMove(e: React.MouseEvent) { setPosition(toPercent(e.clientX)); }
  function onMouseLeave() { setPosition(initialPosition); }

  const touching = React.useRef(false);
  React.useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      if (touching.current && e.touches[0]) setPosition(toPercent(e.touches[0].clientX));
    }
    function onTouchEnd() { touching.current = false; }
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend",  onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const useContent = !!(beforeContent || afterContent);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchStart={() => { touching.current = true; }}
      className={cn(
        "relative w-full cursor-ew-resize select-none overflow-hidden rounded-2xl",
        "border border-white/8 bg-zinc-950 shadow-2xl",
        className,
      )}
    >
      {useContent ? (
        <>
          {/* After content — full-size bottom layer */}
          <div className="absolute inset-0">{afterContent}</div>

          {/* Before content — clipped to the left of the divider */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            {beforeContent}
          </div>
        </>
      ) : (
        <>
          {/* After image — full-size bottom layer */}
          <img
            src={afterImage}
            alt="After"
            className="block h-full w-full object-cover"
            draggable={false}
          />

          {/* Before image — clipped to the left of the divider */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt="Before"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </>
      )}

      {/* Divider line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white/60"
        style={{ left: `${position}%` }}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.75 -translate-x-1/2 bg-white/25 blur-[3px]" />
      </div>

      {/* Handle */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
          "flex h-10 w-10 items-center justify-center",
          "rounded-full border border-white/20 bg-white/10 shadow-xl backdrop-blur-md",
        )}
        style={{ left: `${position}%` }}
      >
        <ChevronsLeftRight className="size-4 text-white" strokeWidth={2.5} />
      </div>

      {/* Labels */}
      {beforeLabel && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm">
          {beforeLabel}
        </span>
      )}
      {afterLabel && (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm">
          {afterLabel}
        </span>
      )}
    </div>
  );
}
