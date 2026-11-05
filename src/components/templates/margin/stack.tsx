"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { STACK } from "./data";
import { Icon } from "./icons";

/**
 * A strip of tool logos that scrolls sideways forever. The list is rendered twice and the track slides by half its
 * width, so the loop has no seam. It pauses on hover and while it is off screen, and stands still for visitors who
 * prefer reduced motion (see `styles.ts`). The second copy is hidden from assistive technology.
 */
export function StackMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref);

  return (
    <div
      ref={ref}
      className="margin-marquee-wrap relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <div className="margin-marquee flex w-max gap-2 py-2" style={onScreen ? undefined : { animationPlayState: "paused" }}>
        {[...STACK, ...STACK].map((tool, index) => (
          <div
            key={index}
            aria-hidden={index >= STACK.length || undefined}
            className="group flex w-[84px] flex-col items-center gap-2 rounded-[12px] py-2 transition-colors hover:bg-[var(--chip)]"
          >
            <span
              className="grid h-9 place-items-center opacity-55 grayscale transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:grayscale-0"
              style={{ color: tool.color }}
            >
              <Icon name={tool.icon} size={28} />
            </span>
            <span className="text-[12px] font-medium" style={{ color: "var(--dim)" }}>
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
