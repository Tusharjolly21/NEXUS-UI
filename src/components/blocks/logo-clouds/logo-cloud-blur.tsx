"use client";
// Blur Hover Reveal: monochrome marks rest at reduced opacity. Hovering one brings it into
// focus while the others soften and recede, like a depth-of-field pull.

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup, type Logo } from "./logos";

const SPRING = { type: "spring" as const, stiffness: 420, damping: 34 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

export type LogoCloudBlurProps = {
  /** Headline above the grid. */
  title?: string;
  /** Line under the headline. Empty string hides it. */
  subtitle?: string;
  /** Marks in the grid. Defaults to the twelve placeholder lockups. */
  logos?: Logo[];
  /** How many marks to show (1–24). Defaults to every logo passed. */
  count?: number;
  /** Opacity of every mark while nothing is hovered (0.1–1). */
  restOpacity?: number;
  /** Opacity of the other marks while one is hovered (0–1). */
  recedeOpacity?: number;
  /** Blur in px on the other marks while one is hovered (0–8). */
  recedeBlur?: number;
  /** Scale of the hovered mark (1–1.3). */
  hoverScale?: number;
  className?: string;
};

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export default function LogoCloudBlur({
  title = "The teams behind the products you open every morning.",
  subtitle = "Hover a name to bring it into focus.",
  logos = LOGOS,
  count,
  restOpacity = 0.5,
  recedeOpacity = 0.2,
  recedeBlur = 2,
  hoverScale = 1.06,
  className,
}: LogoCloudBlurProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const reduced = useReducedMotion();

  const source = Array.isArray(logos) ? logos.slice(0, 24) : LOGOS;
  const visible = source.slice(0, Math.round(clamp(count, 1, 24, source.length)));
  const rest = clamp(restOpacity, 0.1, 1, 0.5);
  const recede = clamp(recedeOpacity, 0, 1, 0.2);
  const blur = clamp(recedeBlur, 0, 8, 2);
  const scale = clamp(hoverScale, 1, 1.3, 1.06);

  const rise: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT },
      };

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            variants={rise}
            className="text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[40px]"
          >
            {title}
          </motion.h2>
          {subtitle ? (
            <motion.p variants={rise} className="mt-3 text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">
              {subtitle}
            </motion.p>
          ) : null}
        </div>

        <ul
          onMouseLeave={() => setHovered(null)}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-2 place-items-center gap-x-6 gap-y-10 text-[#1d1d1f] dark:text-[#f5f5f7] sm:mt-14 sm:grid-cols-3 sm:gap-x-10 md:grid-cols-4 md:gap-y-12"
        >
          {visible.map((logo, i) => {
            const state = hovered === null ? "rest" : hovered === i ? "focus" : "recede";
            return (
              <motion.li key={`${i}-${logo.name}`} variants={rise}>
                <motion.div
                  onHoverStart={() => setHovered(i)}
                  animate={state}
                  initial={false}
                  variants={{
                    rest: { opacity: rest, scale: 1, filter: "blur(0px)" },
                    focus: { opacity: 1, scale: reduced ? 1 : scale, filter: "blur(0px)" },
                    recede: { opacity: recede, scale: reduced ? 1 : 0.97, filter: reduced ? "blur(0px)" : `blur(${blur}px)` },
                  }}
                  transition={SPRING}
                  className="flex cursor-default items-center"
                >
                  <LogoLockup logo={logo} className="text-[17px] sm:text-[20px]" />
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
