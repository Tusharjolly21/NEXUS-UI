"use client";
// Single Row with Hover Lift: the most restrained variant.
// One horizontal row of logos fades in with a light stagger.
// Hovering a logo lifts and sharpens it; all others dim — creating
// a spotlight of attention across the row without any auto-animation.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS } from "./logos";

const ROW_LOGOS = LOGOS.slice(0, 8);
const STAGGER = 0.06;

type Props = { className?: string };

function LogoItem({
  logo,
  index,
  isHovered,
  anyHovered,
  onHoverStart,
  onHoverEnd,
}: {
  logo: (typeof ROW_LOGOS)[number];
  index: number;
  isHovered: boolean;
  anyHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  return (
    // Outer wrapper handles mount stagger — separate from hover state to avoid conflicts
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * STAGGER, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        aria-label={logo.name}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        animate={{
          opacity: anyHovered ? (isHovered ? 1 : 0.28) : 1,
          y: isHovered ? -6 : 0,
          scale: isHovered ? 1.1 : 1,
          filter: anyHovered
            ? isHovered
              ? "brightness(1.1) blur(0px)"
              : "brightness(0.5) blur(0px)"
            : "brightness(1) blur(0px)",
        }}
        transition={{
          opacity: { duration: 0.3, ease: "easeOut" },
          y: { type: "spring", stiffness: 380, damping: 28 },
          scale: { type: "spring", stiffness: 380, damping: 28 },
          filter: { duration: 0.3, ease: "easeOut" },
        }}
        className="flex flex-col items-center gap-1.5"
      >
        <logo.Icon
          aria-hidden="true"
          className="h-8 w-8 sm:h-9 sm:w-9"
          style={{ color: logo.color }}
        />
        <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-600 sm:text-[11px]">
          {logo.name}
        </span>
      </motion.button>
    </motion.div>
  );
}

export default function LogoCloudSingleRow({ className }: Props) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section className={cn("w-full bg-white py-12 px-4 dark:bg-neutral-950 sm:py-16", className)}>
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-lg font-semibold text-neutral-500 md:text-xl dark:text-neutral-400">
          Backed by industry leaders
        </h2>
      </div>

      <div className="mx-auto mt-10 grid grid-cols-4 place-items-center gap-y-8 sm:flex sm:max-w-5xl sm:flex-wrap sm:justify-center sm:gap-10 md:gap-14">
        {ROW_LOGOS.map((logo, i) => (
          <LogoItem
            key={logo.name}
            logo={logo}
            index={i}
            isHovered={hovered === i}
            anyHovered={hovered !== null}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
          />
        ))}
      </div>
    </section>
  );
}
