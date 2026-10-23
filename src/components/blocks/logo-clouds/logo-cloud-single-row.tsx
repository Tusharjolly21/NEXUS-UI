"use client";
// Single Row Lift: the most restrained variant. The line sits on the left and one row of five marks
// rotates through the brands beside it. Hover a mark and it lifts and takes its brand colour while
// the rest of the row recedes, and the rotation holds until the pointer leaves.

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { INK, LOGOS, LogoLockup, SPRING, usePager, type Logo } from "./logos";

export type LogoCloudSingleRowProps = {
  /** Brands to rotate through: { name, Icon, color, wordmark? }. Defaults to twenty invented brands. */
  logos?: Logo[];
  /** The line on the left. */
  title?: string;
  /** Milliseconds between rotations. */
  interval?: number;
  /** Opacity of the other marks while one is hovered (0 to 1). */
  recedeOpacity?: number;
  /** How far the hovered mark lifts, in px. */
  lift?: number;
  className?: string;
};

export default function LogoCloudSingleRow({
  logos = LOGOS,
  title = "Product teams at these companies plan their week with us.",
  interval = 2600,
  recedeOpacity = 0.3,
  lift = 4,
  className,
}: LogoCloudSingleRowProps) {
  const ref = React.useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = !!useReducedMotion();
  const [hover, setHover] = React.useState<number | null>(null);
  const { page, items } = usePager(logos, 5, Math.max(1600, interval), inView && hover === null && !reduced);

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 md:flex-row md:gap-10">
        {title ? (
          <p className="m-0 max-w-[15rem] text-balance text-center text-[17px] font-semibold leading-[1.35] tracking-[-0.015em] text-[#1d1d1f] dark:text-[#f5f5f7] md:shrink-0 md:border-r md:border-black/10 md:pr-10 md:text-left dark:md:border-white/15">
            {title}
          </p>
        ) : null}
        <ul
          ref={ref}
          onMouseLeave={() => setHover(null)}
          className="m-0 grid w-full list-none grid-cols-2 gap-6 p-0 sm:grid-cols-3 md:flex md:flex-1 md:justify-between"
        >
          {items.map((b, i) => (
            <motion.li
              key={i}
              onHoverStart={() => setHover(i)}
              animate={{
                opacity: hover === null ? 0.82 : hover === i ? 1 : recedeOpacity,
                y: hover === i && !reduced ? -lift : 0,
                scale: hover === i && !reduced ? 1.06 : 1,
              }}
              transition={SPRING}
              className={cn("relative flex h-12 items-center justify-center", INK)}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={`${page}-${b.name}`}
                  role="img"
                  aria-label={b.name}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { ...SPRING, delay: i * 0.06 } }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(8px)", transition: { ...SPRING, delay: i * 0.06 } }}
                >
                  <LogoLockup logo={b} tinted={hover === i} className="text-[17px] sm:text-[19px]" />
                </motion.span>
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
