"use client";
// Single Row with Hover Lift: the most restrained variant.
// One horizontal row of logos fades in with a light stagger.
// Hovering a logo lifts and sharpens it; all others dim — creating
// a spotlight of attention across the row without any auto-animation.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

const ROW_LOGOS = LOGOS.slice(0, 6);
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
      <motion.div
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
        className="flex items-center text-neutral-700 dark:text-neutral-300"
      >
        <LogoLockup logo={logo} className="text-[16px] sm:text-[18px]" />
      </motion.div>
    </motion.div>
  );
}

export default function LogoCloudSingleRow({ className }: Props) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section className={cn("w-full bg-white py-12 px-4 dark:bg-neutral-950 sm:py-16", className)}>
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
          Product teams at these companies plan their week with us
        </h2>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 place-items-center gap-x-6 gap-y-7 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-11 sm:gap-y-8">
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
