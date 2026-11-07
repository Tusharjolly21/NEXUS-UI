"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { TwentyFirstLogo } from "@/components/home/twenty-first-logo";

/**
 * The hero's milestone pill: the 21st mark, one line of text and a thin blue edge. A soft light passes
 * over it every few seconds. Opens our 21st.dev profile (the milestone band is not on the landing page,
 * so this must not point at an on-page anchor). With reduced motion nothing moves.
 */
export function HeroMilestone() {
  const still = !!useReducedMotion();
  return (
    <motion.a
      href="https://21st.dev/@nexus-ui"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Almost one million views on 21st.dev. Open our 21st.dev profile in a new tab."
      initial={still ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
      className="group pg-glass relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-card py-2 pl-3 pr-3.5 text-[14px] font-medium text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,oklch(0.485_0.291_264.121)_35%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {!still && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-[color-mix(in_oklab,oklch(0.485_0.291_264.121)_18%,transparent)] to-transparent"
          animate={{ x: ["0%", "420%"] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 4.5 }}
        />
      )}
      <TwentyFirstLogo word={false} className="relative size-[16px]" />
      <span className="relative">Almost 1M views on 21st.dev</span>
      <ChevronRight className="relative size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
    </motion.a>
  );
}
