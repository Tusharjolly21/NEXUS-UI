"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TWENTY_FIRST_BLUE, TwentyFirstLogo } from "@/components/home/twenty-first-logo";

const BLUE = TWENTY_FIRST_BLUE;
const EASE = [0.2, 0.8, 0.2, 1] as const;

/** The Nexus UI mark at small size: black tile, three spokes, blue hub. */
function Mark() {
  return (
    <svg viewBox="0 0 512 512" role="img" aria-label="Nexus UI" className="size-full">
      <rect width="512" height="512" rx="118" fill="#0d0d0f" />
      {[
        [255, 105],
        [106, 359],
        [406, 359],
      ].map(([x, y]) => (
        <g key={x}>
          <line x1="255" y1="258" x2={x} y2={y} stroke="#f4f1ec" strokeWidth="19" strokeLinecap="round" />
          <circle cx={x} cy={y} r="27" fill="#f4f1ec" />
        </g>
      ))}
      <circle cx="255" cy="258" r="44" fill="#f4f1ec" />
      <circle cx="255" cy="258" r="36" fill="#7b9bff" />
    </svg>
  );
}

/**
 * The hero's milestone badge: Nexus UI and 21st.dev joined by a stream of views, with the headline numbers
 * beside them. A slow blue light travels around the edge; everything is motion, no copy to read twice.
 * Links down to the full milestone band. With reduced motion it sits still.
 */
export function HeroMilestone() {
  const still = !!useReducedMotion();
  return (
    <motion.a
      href="#21st"
      aria-label="Almost one million views and 3.8 thousand bookmarks on 21st.dev. See the details."
      initial={still ? false : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
      className="group relative inline-flex max-w-full overflow-hidden rounded-full p-[1.5px] shadow-[0_18px_44px_-18px_color-mix(in_oklab,oklch(0.485_0.291_264.121)_70%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {/* the travelling light on the rim */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2"
        style={{ background: `conic-gradient(from 0deg, transparent 0 62%, ${BLUE} 82%, #7b9bff 92%, transparent 100%)` }}
        animate={still ? undefined : { rotate: 360 }}
        transition={{ duration: 5, ease: "linear", repeat: Infinity }}
      />
      <span className="relative flex items-center gap-3 rounded-full bg-card py-2 pl-2.5 pr-5 sm:gap-4 sm:py-2.5 sm:pl-3 sm:pr-6">
        {/* marks and the stream between them */}
        <span className="flex items-center gap-2 sm:gap-2.5">
          <span className="size-9 shrink-0 overflow-hidden rounded-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] sm:size-10">
            <Mark />
          </span>
          <span aria-hidden className="relative block h-5 w-9 sm:w-14">
            <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)`, opacity: 0.6 }} />
            {!still &&
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute top-1/2 -ml-[2.5px] -mt-[2.5px] block size-[5px] rounded-full"
                  style={{ background: BLUE, boxShadow: `0 0 8px 1px ${BLUE}` }}
                  initial={{ left: "100%", opacity: 0 }}
                  animate={{ left: ["100%", "0%"], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.9, ease: "linear", repeat: Infinity, delay: i * 0.63, times: [0, 0.2, 0.8, 1] }}
                />
              ))}
          </span>
          <TwentyFirstLogo className="h-[18px] w-auto text-foreground sm:h-[22px]" />
        </span>
        <span aria-hidden className="hidden h-7 w-px bg-border sm:block" />
        <span className="flex flex-col items-start text-left leading-tight">
          <span className="text-[15px] font-semibold tracking-[-0.2px] text-foreground sm:text-[17px]">
            930K views <span className="text-muted-foreground">&middot;</span> 3.8K bookmarks
          </span>
          <span className="hidden text-[12.5px] text-muted-foreground sm:block">Our 21st.dev profile</span>
        </span>
      </span>
    </motion.a>
  );
}
