"use client";
// Infinite Marquee: two rows of monochrome marks drift in opposite directions. The edges fade
// out with a mask rather than a painted gradient, so the band sits on any background.

import * as React from "react";
import Marquee from "react-fast-marquee";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup, type Logo } from "./logos";

const SPEED = 34;
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

const ROW_ONE = LOGOS.slice(0, 6);
const ROW_TWO = LOGOS.slice(6, 12);

const EDGE_MASK = "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";

type Props = { className?: string };

function LogoItem({ logo }: { logo: Logo }) {
  return (
    <div className="mx-7 flex items-center text-[#1d1d1f]/50 transition-colors duration-300 ease-out hover:text-[#1d1d1f] dark:text-[#f5f5f7]/50 dark:hover:text-[#f5f5f7] sm:mx-10">
      <LogoLockup logo={logo} className="text-[17px] sm:text-[20px]" />
    </div>
  );
}

export default function LogoCloudMarquee({ className }: Props) {
  const reduced = useReducedMotion();
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
          <motion.p variants={rise} className="text-[17px] font-semibold tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]">
            Customers
          </motion.p>
          <motion.h2
            variants={rise}
            className="mt-2 text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[40px]"
          >
            Running in production at 2,400 teams, from two-person studios to public companies.
          </motion.h2>
        </div>

        <motion.div
          variants={rise}
          className="relative mt-12 overflow-hidden motion-reduce:[&_.rfm-marquee]:![animation-play-state:paused] sm:mt-14"
          style={{ WebkitMaskImage: EDGE_MASK, maskImage: EDGE_MASK }}
        >
          <div className="flex flex-col gap-8 sm:gap-10">
            <Marquee speed={SPEED} gradient={false} pauseOnHover>
              {[...ROW_ONE, ...ROW_ONE].map((logo, i) => (
                <LogoItem key={`${logo.name}-${i}`} logo={logo} />
              ))}
            </Marquee>

            <Marquee speed={SPEED} direction="right" gradient={false} pauseOnHover>
              {[...ROW_TWO, ...ROW_TWO].map((logo, i) => (
                <LogoItem key={`${logo.name}-${i}`} logo={logo} />
              ))}
            </Marquee>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
