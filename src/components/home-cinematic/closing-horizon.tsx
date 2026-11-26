"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * The finale: the edge of a planet rises into view as the section scrolls in, its rim lit in the
 * Nexus spectrum, with the last call to action standing on the horizon.
 */
export function ClosingHorizon({ children }: { children: React.ReactNode }) {
  const reduce = !!useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const spring = { stiffness: 90, damping: 24 };
  const rise = useSpring(useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [220, 0]), spring);
  const glow = useTransform(scrollYProgress, [0.3, 1], reduce ? [1, 1] : [0, 1]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, 0]);

  return (
    <section ref={ref} className="cx-section relative isolate overflow-hidden px-4 pb-0 pt-28 sm:pt-36">
      <motion.div style={{ y: copyY }} className="relative z-10 mx-auto max-w-[860px] text-center">
        {children}
      </motion.div>

      {/* the planet: its glow, its lit rim, and the dark (or light) body below the horizon */}
      <motion.div style={{ y: rise }} aria-hidden className="relative mx-auto mt-16 h-[260px] w-full sm:mt-20 sm:h-[340px]">
        <motion.div style={{ opacity: glow }} className="absolute inset-0">
          <div className="cx-horizon-glow" />
        </motion.div>
        <div className="cx-planet" />
      </motion.div>
    </section>
  );
}
