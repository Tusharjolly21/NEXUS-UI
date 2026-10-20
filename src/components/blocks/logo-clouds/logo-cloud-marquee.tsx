"use client";
// Infinite Marquee: two rows of monochrome marks drift in opposite directions. The edges fade
// out with a mask rather than a painted gradient, so the band sits on any background.

import * as React from "react";
import Marquee from "react-fast-marquee";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup, type Logo } from "./logos";

const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

const EDGE_MASK = "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";

export type LogoCloudMarqueeProps = {
  /** Small grey label above the headline. Empty string hides it. */
  eyebrow?: string;
  /** Headline above the band. */
  title?: string;
  /** Drift speed in px per second (5–200). */
  speed?: number;
  /** One row, or two rows drifting in opposite directions (the list is split in half). */
  rows?: number;
  /** Pause a row while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Fade the band out at both edges with a mask. */
  fadeEdges?: boolean;
  /** Marks in the band (up to 24). Defaults to the twelve placeholder lockups. */
  logos?: Logo[];
  className?: string;
};

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function LogoItem({ logo }: { logo: Logo }) {
  return (
    <div className="mx-7 flex items-center text-[#1d1d1f]/50 transition-colors duration-300 ease-out hover:text-[#1d1d1f] dark:text-[#f5f5f7]/50 dark:hover:text-[#f5f5f7] sm:mx-10">
      <LogoLockup logo={logo} className="text-[17px] sm:text-[20px]" />
    </div>
  );
}

export default function LogoCloudMarquee({
  eyebrow = "Customers",
  title = "Running in production at 2,400 teams, from two-person studios to public companies.",
  speed = 34,
  rows = 2,
  pauseOnHover = true,
  fadeEdges = true,
  logos = LOGOS,
  className,
}: LogoCloudMarqueeProps) {
  const reduced = useReducedMotion();
  const source = Array.isArray(logos) ? logos.slice(0, 24) : LOGOS;
  const rowSpeed = clamp(speed, 5, 200, 34);
  const twoRows = Math.round(clamp(rows, 1, 2, 2)) === 2 && source.length > 1;
  const half = Math.ceil(source.length / 2);
  const rowOne = twoRows ? source.slice(0, half) : source;
  const rowTwo = twoRows ? source.slice(half) : [];
  const rise: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT },
      };

  return (
    <section className={cn("w-full bg-white py-16 dark:bg-black sm:py-24", className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          {eyebrow ? (
            <motion.p variants={rise} className="text-[17px] font-semibold tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]">
              {eyebrow}
            </motion.p>
          ) : null}
          <motion.h2
            variants={rise}
            className={cn(
              eyebrow ? "mt-2" : null,
              "text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[40px]",
            )}
          >
            {title}
          </motion.h2>
        </div>

        <motion.div
          variants={rise}
          className="relative mt-12 overflow-hidden motion-reduce:[&_.rfm-marquee]:![animation-play-state:paused] sm:mt-14"
          style={fadeEdges ? { WebkitMaskImage: EDGE_MASK, maskImage: EDGE_MASK } : undefined}
        >
          <div className="flex flex-col gap-8 sm:gap-10">
            <Marquee speed={rowSpeed} gradient={false} pauseOnHover={pauseOnHover}>
              {[...rowOne, ...rowOne].map((logo, i) => (
                <LogoItem key={`${logo.name}-${i}`} logo={logo} />
              ))}
            </Marquee>

            {rowTwo.length > 0 ? (
              <Marquee speed={rowSpeed} direction="right" gradient={false} pauseOnHover={pauseOnHover}>
                {[...rowTwo, ...rowTwo].map((logo, i) => (
                  <LogoItem key={`${logo.name}-${i}`} logo={logo} />
                ))}
              </Marquee>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
