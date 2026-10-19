"use client";
// Periodic Blur-Flip: monochrome marks hold their places in a quiet grid. Every `interval` ms each
// mark rolls over in place, one after another: the face tips back and blurs away while a fresh copy
// springs up from below. Transforms and opacity only, so nothing around it shifts.

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogoEntry = {
  icon: React.ReactNode;
  name?: string;
  id?: string;
};

export type LogosBlurFlipProps = {
  logos?: LogoEntry[];
  title?: string;
  subtitle?: string;
  interval?: number;
  className?: string;
};

// ─── Animation config ─────────────────────────────────────────────────────────

const STAGGER = 0.05;
const FLIP = { type: "spring" as const, stiffness: 300, damping: 26 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

// ─── Default logos ────────────────────────────────────────────────────────────

const DEFAULT_LOGOS: LogoEntry[] = LOGOS.map((l) => ({
  icon: <LogoLockup logo={l} className="text-[17px] sm:text-[19px]" />,
  id: l.name,
}));

// ─── Logo Item ────────────────────────────────────────────────────────────────

function LogoFace({ logo }: { logo: LogoEntry }) {
  return (
    <>
      <span className="flex h-9 min-w-9 items-center justify-center sm:h-10 sm:min-w-10">{logo.icon}</span>
      {logo.name ? (
        <span className="select-none whitespace-nowrap text-[12px] font-medium">{logo.name}</span>
      ) : null}
    </>
  );
}

function LogoItem({
  logo,
  index,
  cycle,
  reduced,
  rise,
}: {
  logo: LogoEntry;
  index: number;
  cycle: number;
  reduced: boolean;
  rise: Variants;
}) {
  const delay = index * STAGGER;
  return (
    // the list item takes the entrance; the inner wrapper owns the resting opacity and hover
    <motion.li variants={rise} role={logo.name ? "img" : undefined} aria-label={logo.name} className="w-full">
      <div className="relative flex h-16 items-center justify-center text-[#1d1d1f] opacity-55 transition-opacity duration-300 ease-out [perspective:700px] hover:opacity-100 dark:text-[#f5f5f7]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={cycle}
            className="flex origin-center flex-col items-center gap-1.5"
            initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: 80, y: "45%", filter: "blur(8px)" }}
            animate={{ opacity: 1, rotateX: 0, y: 0, filter: "blur(0px)", transition: { ...FLIP, delay } }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.2, delay } }
                : { opacity: 0, rotateX: -80, y: "-45%", filter: "blur(8px)", transition: { ...FLIP, delay } }
            }
          >
            <LogoFace logo={logo} />
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LogosBlurFlip({
  logos = DEFAULT_LOGOS,
  title = "Used by teams that ship every week",
  subtitle = "From two-person studios to platform teams of four hundred.",
  interval = 2600,
  className,
}: LogosBlurFlipProps) {
  const ref = React.useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = !!useReducedMotion();
  const [cycle, setCycle] = React.useState(0);

  React.useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), interval);
    return () => window.clearInterval(id);
  }, [inView, interval, reduced]);

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
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
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
          ref={ref}
          className="mx-auto mt-12 grid max-w-5xl grid-cols-2 place-items-center gap-x-4 gap-y-4 sm:mt-14 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-6"
        >
          {logos.map((logo, i) => (
            <LogoItem key={logo.id ?? i} logo={logo} index={i} cycle={cycle} reduced={reduced} rise={rise} />
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
