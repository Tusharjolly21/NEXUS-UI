"use client";
// Single Row with Hover Lift: the most restrained variant. One row of monochrome marks settles in
// with a light stagger. Hovering a mark lifts it on a spring while the rest of the row recedes.

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

const ROW_LOGOS = LOGOS.slice(0, 6);
const STAGGER = 0.06;
const SPRING = { type: "spring" as const, stiffness: 420, damping: 30 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

type Props = { className?: string };

function LogoItem({
  logo,
  rise,
  reduced,
  isHovered,
  anyHovered,
  onHoverStart,
}: {
  logo: (typeof ROW_LOGOS)[number];
  rise: Variants;
  reduced: boolean;
  isHovered: boolean;
  anyHovered: boolean;
  onHoverStart: () => void;
}) {
  return (
    // Outer wrapper takes the entrance stagger; the inner one owns hover, so the two never fight
    <motion.li variants={rise}>
      <motion.div
        onHoverStart={onHoverStart}
        initial={false}
        animate={{
          opacity: anyHovered ? (isHovered ? 1 : 0.22) : 0.55,
          y: isHovered && !reduced ? -4 : 0,
          scale: isHovered && !reduced ? 1.06 : 1,
        }}
        transition={SPRING}
        className="flex cursor-default items-center text-[#1d1d1f] dark:text-[#f5f5f7]"
      >
        <LogoLockup logo={logo} className="text-[16px] sm:text-[18px]" />
      </motion.div>
    </motion.li>
  );
}

export default function LogoCloudSingleRow({ className }: Props) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const reduced = !!useReducedMotion();

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
        <motion.h2
          variants={rise}
          className="text-center text-[15px] font-medium tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]"
        >
          Product teams at these companies plan their week with us.
        </motion.h2>

        <ul
          onMouseLeave={() => setHovered(null)}
          className="mt-9 grid grid-cols-2 place-items-center gap-x-6 gap-y-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-12 sm:gap-y-8"
        >
          {ROW_LOGOS.map((logo, i) => (
            <LogoItem
              key={logo.name}
              logo={logo}
              rise={rise}
              reduced={reduced}
              isHovered={hovered === i}
              anyHovered={hovered !== null}
              onHoverStart={() => setHovered(i)}
            />
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
