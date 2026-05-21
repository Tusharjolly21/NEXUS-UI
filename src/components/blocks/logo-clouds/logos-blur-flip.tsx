"use client";
// Periodic Blur-Flip: logos sit in a stationary row. Every `interval` ms,
// all logos play a blur-flip-in-place sequence simultaneously — they drift
// up, blur out, rotateX-flip, then snap back sharp — while holding their
// positions. No scroll, no marquee. GPU-only transforms for zero layout shift.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS } from "./logos";

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
  icon: <l.Icon className="h-8 w-8" style={{ color: l.color }} aria-hidden="true" />,
  name: l.name,
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
      aria-label={logo.name ?? "Logo"}
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
      className={cn(
        "flex w-18 shrink-0 cursor-default flex-col items-center gap-2 rounded-xl sm:w-22.5",
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
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
  title = "Trusted by the best companies",
  subtitle = "The world's most ambitious teams build with our platform.",
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
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        )}
      </div>

      <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
        {/* Desktop: single flex row */}
        <div className="hidden items-center justify-center gap-4 sm:flex sm:flex-wrap sm:gap-6 md:gap-8 lg:gap-10">
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
        <div className="grid grid-cols-3 place-items-center gap-y-6 sm:hidden">
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
