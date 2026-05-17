"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  speed?: number;
}

export function Marquee({ children, className, pauseOnHover = false, reverse = false, speed = 40 }: MarqueeProps) {
  return (
    <div
      className={cn(
        "flex overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <div
        className="flex gap-4"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
        onMouseEnter={() => { if (pauseOnHover) { const el = document.querySelector<HTMLElement>("[data-marquee]"); if (el) el.style.animationPlayState = "paused"; } }}
        onMouseLeave={() => { if (pauseOnHover) { const el = document.querySelector<HTMLElement>("[data-marquee]"); if (el) el.style.animationPlayState = "running"; } }}
        data-marquee
      >
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden="true">{children}</div>
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}