"use client";
// Blur Flip Grid: eight marks hold their places in a quiet grid. Every `interval` ms each slot rolls
// over to the next brand, one after another: the old lockup tips back and blurs away while the new
// one springs up from below. Transforms, opacity and blur only, so nothing around it shifts. Pauses
// while off screen and never runs under reduced motion.

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { INK, LOGOS, LogoHeading, LogoLockup, SPRING, usePager, type Logo } from "./logos";

export type LogosBlurFlipProps = {
  /** Brands to roll through: { name, Icon, color, wordmark? }. Defaults to twenty invented brands. */
  logos?: Logo[];
  /** Headline above the grid. */
  title?: string;
  /** Line under the headline. Leave empty to hide it. */
  subtitle?: string;
  /** Milliseconds between flips. Each slot follows the one before by 70ms. */
  interval?: number;
  className?: string;
};

export default function LogosBlurFlip({
  logos = LOGOS,
  title = "Used by teams that ship every week",
  subtitle = "From two-person studios to platform teams of four hundred.",
  interval = 3000,
  className,
}: LogosBlurFlipProps) {
  const ref = React.useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = !!useReducedMotion();
  const { page, items } = usePager(logos, 8, interval, inView && !reduced);

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <LogoHeading title={title} subtitle={subtitle} />
      <ul ref={ref} className="m-0 mx-auto mt-12 grid max-w-3xl list-none grid-cols-2 gap-x-6 gap-y-4 p-0 sm:mt-14 sm:grid-cols-4">
        {items.map((b, i) => (
          <li key={i} className={cn("relative flex h-16 items-center justify-center opacity-80 [perspective:700px] hover:opacity-100", INK)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${page}-${b.name}`}
                role="img"
                aria-label={b.name}
                initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: 80, y: "45%", filter: "blur(8px)" }}
                animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)", transition: { ...SPRING, delay: i * 0.07 } }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -80, y: "-45%", filter: "blur(8px)", transition: { ...SPRING, delay: i * 0.07 } }}
              >
                <LogoLockup logo={b} className="text-[19px] sm:text-[21px]" />
              </motion.span>
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </section>
  );
}
