"use client";
// Swap Animation: ten slots show one page of brands at a time. Every `interval` ms the next page
// slides through from the right, slot by slot: each outgoing lockup slides left and blurs out while
// the incoming one arrives from the right. Pauses on hover and while off screen.

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { INK, LOGOS, LogoHeading, LogoLockup, SPRING, usePager, type Logo } from "./logos";

export type LogoCloudSwapProps = {
  /** Brands to page through: { name, Icon, color, wordmark? }. Defaults to twenty invented brands. */
  logos?: Logo[];
  /** Headline above the grid. */
  title?: string;
  /** Line under the headline. Leave empty to hide it. */
  subtitle?: string;
  /** Milliseconds between pages. */
  interval?: number;
  /** Delay between one slot and the next, in seconds. */
  stagger?: number;
  className?: string;
};

export default function LogoCloudSwap({
  logos = LOGOS,
  title = "Chosen by teams who sweat the details",
  subtitle = "Each of these replaced three tools with one.",
  interval = 3000,
  stagger = 0.05,
  className,
}: LogoCloudSwapProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = !!useReducedMotion();
  const [held, setHeld] = React.useState(false);
  const { page, items } = usePager(logos, 10, interval, inView && !held && !reduced);

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <LogoHeading title={title} subtitle={subtitle} />
      <div
        ref={ref}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-5 sm:mt-14 sm:grid-cols-5"
      >
        {items.map((b, i) => (
          <div key={i} className={cn("relative flex h-14 items-center justify-center opacity-80 hover:opacity-100", INK)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${page}-${b.name}`}
                role="img"
                aria-label={b.name}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)", transition: { ...SPRING, delay: i * stagger } }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -40, filter: "blur(8px)", transition: { ...SPRING, delay: i * stagger } }}
              >
                <LogoLockup logo={b} className="text-[17px] sm:text-[19px]" />
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
