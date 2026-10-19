"use client";
// Periodic Blur-Flip: logos sit in a stationary row. Every `interval` ms,
// all logos play a blur-flip-in-place sequence simultaneously — they drift
// up, blur out, rotateX-flip, then snap back sharp — while holding their
// positions. No scroll, no marquee. GPU-only transforms for zero layout shift.

import * as React from "react";
import { motion } from "framer-motion";
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

const FLIP_DURATION = 0.72;
const FLIP_TIMES = [0, 0.38, 1];
const STAGGER = 0.05;

// ─── Default logos ────────────────────────────────────────────────────────────

const DEFAULT_LOGOS: LogoEntry[] = LOGOS.map((l) => ({
  icon: <LogoLockup logo={l} className="text-[18px] sm:text-[20px]" />,
  id: l.name,
}));

// ─── Logo Item ────────────────────────────────────────────────────────────────

function LogoItem({
  logo,
  index,
  isFlipping,
  onFlipDone,
}: {
  logo: LogoEntry;
  index: number;
  isFlipping: boolean;
  onFlipDone: () => void;
}) {
  return (
    <motion.div
      role={logo.name ? "img" : undefined}
      aria-label={logo.name}
      style={{ transformPerspective: 700 }}
      animate={
        isFlipping
          ? {
              opacity: [1, 0, 1],
              filter: ["blur(0px)", "blur(10px)", "blur(0px)"],
              y: [0, -10, 0],
              rotateX: [0, -50, 0],
              scale: [1, 0.88, 1],
            }
          : {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              rotateX: 0,
              scale: 1,
            }
      }
      transition={
        isFlipping
          ? {
              duration: FLIP_DURATION,
              times: FLIP_TIMES,
              ease: "easeInOut",
              delay: index * STAGGER,
            }
          : { duration: 0.28, ease: "easeOut" }
      }
      onAnimationComplete={() => {
        if (isFlipping && index === 0) onFlipDone();
      }}
      whileHover={{ scale: 1.05, y: -3 }}
      className="flex shrink-0 cursor-default flex-col items-center gap-2 text-neutral-700 dark:text-neutral-300"
    >
      <span className="flex h-9 min-w-9 items-center justify-center sm:h-10 sm:min-w-10">
        {logo.icon}
      </span>
      {logo.name && (
        <span className="select-none whitespace-nowrap text-[10px] font-medium tracking-wide text-neutral-400 dark:text-neutral-600 sm:text-[11px]">
          {logo.name}
        </span>
      )}
    </motion.div>
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
  const [flipping, setFlipping] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setFlipping(true), interval);
    return () => clearInterval(id);
  }, [interval]);

  function handleFlipDone() {
    setFlipping(false);
  }

  return (
    <section className={cn("w-full bg-white px-4 py-12 dark:bg-neutral-950 sm:py-16", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-neutral-950 md:text-[34px] dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-[15px] text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        )}
      </div>

      <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
        {/* Desktop: single flex row */}
        <div className="hidden items-center justify-center sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-8 lg:gap-x-12">
          {logos.map((logo, i) => (
            <LogoItem
              key={logo.id ?? i}
              logo={logo}
              index={i}
              isFlipping={flipping}
              onFlipDone={handleFlipDone}
            />
          ))}
        </div>

        {/* Mobile: 3-col grid */}
        <div className="grid grid-cols-2 place-items-center gap-x-4 gap-y-7 sm:hidden">
          {logos.map((logo, i) => (
            <LogoItem
              key={logo.id ?? i}
              logo={logo}
              index={i}
              isFlipping={flipping}
              onFlipDone={handleFlipDone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
