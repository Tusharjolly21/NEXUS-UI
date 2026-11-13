"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { TwentyFirstLogo } from "@/components/home/twenty-first-logo";

const MotionLink = motion.create(Link);

/**
 * The hero's milestone pill: the 21st mark, "Almost 1M views on 21st.dev", and "See our impact", with a thin
 * blue edge. A soft light passes over it every few seconds. It opens /impact, our numbers from 21st.dev
 * (that page links on to the profile itself). With reduced motion nothing moves.
 */
export function HeroMilestone() {
  const still = !!useReducedMotion();
  return (
    <MotionLink
      href="/impact"
      aria-label="Almost one million views on 21st.dev. See our impact."
      initial={still ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
      className="group pg-glass relative inline-flex max-w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1 overflow-hidden rounded-[22px] bg-card py-2 pl-3 pr-3.5 text-[13.5px] font-medium text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,oklch(0.485_0.291_264.121)_35%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:flex-nowrap sm:rounded-full sm:text-[14px]"
    >
      {!still && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-[color-mix(in_oklab,oklch(0.485_0.291_264.121)_18%,transparent)] to-transparent"
          animate={{ x: ["0%", "420%"] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 4.5 }}
        />
      )}
      <span className="relative inline-flex items-center gap-2.5">
        <TwentyFirstLogo word={false} className="size-[16px]" />
        <span>Almost 1M views on 21st.dev</span>
      </span>
      <span className="relative inline-flex items-center gap-0.5 font-semibold text-[oklch(0.485_0.291_264.121)] dark:text-[#8aa0ff]">
        See our impact
        <ChevronRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </MotionLink>
  );
}
