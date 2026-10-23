"use client";
// Infinite Marquee: two rows of brands drift in opposite directions at slightly different speeds,
// faded out at both edges. Hover a row and it eases to a stop, then picks up again. Pure
// requestAnimationFrame, no marquee package; it stops while off screen and under reduced motion.

import * as React from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { EDGE, LOGOS, LogoHeading, LogoLockup, Track, type Logo } from "./logos";

export type LogoCloudMarqueeProps = {
  /** Brands to scroll: { name, Icon, color, wordmark? }. Defaults to twenty invented brands. */
  logos?: Logo[];
  /** Small grey label above the headline. Leave empty to hide it. */
  eyebrow?: string;
  /** Headline above the band. */
  title?: string;
  /** Drift speed of the first row, in px per second. The second row is a little slower. */
  speed?: number;
  /** One row, or two rows drifting in opposite directions (the list is split in half). */
  rows?: 1 | 2;
  /** Ease a row to a stop while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Fade the band out at both edges with a mask. */
  fadeEdges?: boolean;
  className?: string;
};

export default function LogoCloudMarquee({
  logos = LOGOS,
  eyebrow = "Customers",
  title = "Running in production at 2,400 teams.",
  speed = 34,
  rows = 2,
  pauseOnHover = true,
  fadeEdges = true,
  className,
}: LogoCloudMarqueeProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const half = Math.ceil(logos.length / 2);
  const lists = rows === 2 ? [logos.slice(0, half), logos.slice(half)] : [logos];
  const item = (b: Logo | null, i: number) =>
    b ? (
      <span key={`${b.name}-${i}`} className="flex items-center px-6 text-[#1d1d1f]/80 hover:text-[#1d1d1f] dark:text-[#f5f5f7]/80 dark:hover:text-[#f5f5f7]">
        <LogoLockup logo={b} tinted className="text-[19px] sm:text-[21px]" />
      </span>
    ) : null;

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <LogoHeading eyebrow={eyebrow} title={title} />
      <div
        ref={ref}
        className="mt-12 flex flex-col gap-8 overflow-hidden sm:mt-14"
        style={fadeEdges ? { WebkitMaskImage: EDGE, maskImage: EDGE } : undefined}
      >
        {lists.map((list, r) => (
          <Track key={r} items={list} speed={r === 0 ? speed : speed * 0.8} reverse={r === 1} render={item} gap={8} active={inView} pauseOnHover={pauseOnHover} />
        ))}
      </div>
    </section>
  );
}
