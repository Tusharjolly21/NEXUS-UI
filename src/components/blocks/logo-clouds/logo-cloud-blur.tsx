"use client";
// Blur Hover Reveal: monochrome marks rest at reduced opacity. Hovering one brings it into
// focus while the others soften and recede, like a depth-of-field pull.

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

const SPRING = { type: "spring" as const, stiffness: 420, damping: 34 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

type Props = { className?: string };

export default function LogoCloudBlur({ className }: Props) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const reduced = useReducedMotion();

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
            The teams behind the products you open every morning.
          </motion.h2>
          <motion.p variants={rise} className="mt-3 text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">
            Hover a name to bring it into focus.
          </motion.p>
        </div>

        <ul
          onMouseLeave={() => setHovered(null)}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-2 place-items-center gap-x-6 gap-y-10 text-[#1d1d1f] dark:text-[#f5f5f7] sm:mt-14 sm:grid-cols-3 sm:gap-x-10 md:grid-cols-4 md:gap-y-12"
        >
          {LOGOS.map((logo, i) => {
            const state = hovered === null ? "rest" : hovered === i ? "focus" : "recede";
            return (
              <motion.li key={logo.name} variants={rise}>
                <motion.div
                  onHoverStart={() => setHovered(i)}
                  animate={state}
                  initial={false}
                  variants={{
                    rest: { opacity: 0.5, scale: 1, filter: "blur(0px)" },
                    focus: { opacity: 1, scale: reduced ? 1 : 1.06, filter: "blur(0px)" },
                    recede: { opacity: 0.2, scale: reduced ? 1 : 0.97, filter: reduced ? "blur(0px)" : "blur(2px)" },
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
