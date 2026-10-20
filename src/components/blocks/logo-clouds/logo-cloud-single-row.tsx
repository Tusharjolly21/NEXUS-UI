"use client";
// Single Row with Hover Lift: the most restrained variant. One row of monochrome marks settles in
// with a light stagger. Hovering a mark lifts it on a spring while the rest of the row recedes.

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup, type Logo } from "./logos";

const STAGGER = 0.06;
const SPRING = { type: "spring" as const, stiffness: 420, damping: 30 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

export type LogoCloudSingleRowProps = {
  /** Small grey line above the row. Empty string hides it. */
  title?: string;
  /** How many marks to show (1–12), taken from the start of `logos`. */
  count?: number;
  /** Opacity of every mark while nothing is hovered (0.1–1). */
  restOpacity?: number;
  /** Opacity of the other marks while one is hovered (0–1). */
  recedeOpacity?: number;
  /** How far the hovered mark lifts, in px (0–16). */
  lift?: number;
  /** Scale of the hovered mark (1–1.3). */
  hoverScale?: number;
  /** Marks to pick from. Defaults to the twelve placeholder lockups. */
  logos?: Logo[];
  className?: string;
};

type HoverLook = { rest: number; recede: number; lift: number; scale: number };

function clamp(value: number | undefined, min: number, max: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function LogoItem({
  logo,
  rise,
  reduced,
  isHovered,
  anyHovered,
  onHoverStart,
  look,
}: {
  logo: Logo;
  rise: Variants;
  reduced: boolean;
  isHovered: boolean;
  anyHovered: boolean;
  onHoverStart: () => void;
  look: HoverLook;
}) {
  return (
    // Outer wrapper takes the entrance stagger; the inner one owns hover, so the two never fight
    <motion.li variants={rise}>
      <motion.div
        onHoverStart={onHoverStart}
        initial={false}
        animate={{
          opacity: anyHovered ? (isHovered ? 1 : look.recede) : look.rest,
          y: isHovered && !reduced ? -look.lift : 0,
          scale: isHovered && !reduced ? look.scale : 1,
        }}
        transition={SPRING}
        className="flex cursor-default items-center text-[#1d1d1f] dark:text-[#f5f5f7]"
      >
        <LogoLockup logo={logo} className="text-[16px] sm:text-[18px]" />
      </motion.div>
    </motion.li>
  );
}

export default function LogoCloudSingleRow({
  title = "Product teams at these companies plan their week with us.",
  count = 6,
  restOpacity = 0.55,
  recedeOpacity = 0.22,
  lift = 4,
  hoverScale = 1.06,
  logos = LOGOS,
  className,
}: LogoCloudSingleRowProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const reduced = !!useReducedMotion();

  const source = Array.isArray(logos) ? logos : LOGOS;
  const rowLogos = source.slice(0, Math.round(clamp(count, 1, 12, 6)));
  const look: HoverLook = {
    rest: clamp(restOpacity, 0.1, 1, 0.55),
    recede: clamp(recedeOpacity, 0, 1, 0.22),
    lift: clamp(lift, 0, 16, 4),
    scale: clamp(hoverScale, 1, 1.3, 1.06),
  };

  const rise: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT },
      };

  return (
    <section className={cn("w-full bg-white px-4 py-14 dark:bg-black sm:py-20", className)}>
      <motion.div
        className="mx-auto max-w-5xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: STAGGER } } }}
      >
        {title ? (
          <motion.h2
            variants={rise}
            className="text-center text-[15px] font-medium tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]"
          >
            {title}
          </motion.h2>
        ) : null}

        <ul
          onMouseLeave={() => setHovered(null)}
          className={cn(
            title ? "mt-9" : null,
            "grid grid-cols-2 place-items-center gap-x-6 gap-y-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-12 sm:gap-y-8",
          )}
        >
          {rowLogos.map((logo, i) => (
            <LogoItem
              key={`${i}-${logo.name}`}
              logo={logo}
              rise={rise}
              reduced={reduced}
              isHovered={hovered === i}
              anyHovered={hovered !== null}
              onHoverStart={() => setHovered(i)}
              look={look}
            />
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
