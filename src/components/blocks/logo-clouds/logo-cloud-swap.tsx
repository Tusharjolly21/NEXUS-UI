"use client";
// Per-Icon Left-to-Right Reveal: each icon blurs out, then the sharp version
// sweeps back in from its left edge to its right edge using clipPath.
// This per-icon wipe cascades sequentially across the row left → right.

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGOS, LogoLockup } from "./logos";

export type LogoEntry = {
  icon: React.ReactNode;
  name?: string;
  id?: string;
};

export type LogoCloudSwapProps = {
  logos?: LogoEntry[];
  title?: string;
  subtitle?: string;
  interval?: number;
  stagger?: number;
  className?: string;
};

const WIPE_DURATION = 0.92;
const WIPE_TIMES = [0, 0.4, 1];

const DEFAULT_LOGOS: LogoEntry[] = LOGOS.map((l) => ({
  icon: <LogoLockup logo={l} className="text-[18px] sm:text-[20px]" />,
  id: l.name,
}));

function LogoItem({
  logo,
  index,
  isWaving,
  stagger,
  totalCount,
  onDone,
}: {
  logo: LogoEntry;
  index: number;
  isWaving: boolean;
  stagger: number;
  totalCount: number;
  onDone: () => void;
}) {
  return (
    <motion.div
      role={logo.name ? "img" : undefined}
      aria-label={logo.name}
      animate={
        isWaving
          ? {
              clipPath: [
                "inset(0 0% 0 0)",
                "inset(0 100% 0 0)",
                "inset(0 0% 0 0)",
              ],
              filter: ["blur(0px)", "blur(8px)", "blur(0px)"],
              opacity: [1, 0.2, 1],
            }
          : {
              clipPath: "inset(0 0% 0 0)",
              filter: "blur(0px)",
              opacity: 1,
            }
      }
      transition={
        isWaving
          ? {
              clipPath: {
                duration: WIPE_DURATION,
                times: WIPE_TIMES,
                ease: ["easeIn", [0.16, 1, 0.3, 1]],
                delay: index * stagger,
              },
              filter: {
                duration: WIPE_DURATION * 0.9,
                times: WIPE_TIMES,
                ease: "easeInOut" as const,
                delay: index * stagger,
              },
              opacity: {
                duration: WIPE_DURATION * 0.85,
                times: WIPE_TIMES,
                ease: "easeInOut" as const,
                delay: index * stagger,
              },
            }
          : {
              duration: 0.3,
              ease: "easeOut",
            }
      }
      onAnimationComplete={() => {
        if (isWaving && index === totalCount - 1) onDone();
      }}
      whileHover={{
        scale: 1.07,
        opacity: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 340, damping: 24 },
      }}
      className="flex shrink-0 cursor-default flex-col items-center gap-2 text-neutral-700 dark:text-neutral-300"
    >
      <span className="flex h-9 min-w-9 items-center justify-center sm:h-10 sm:min-w-10">{logo.icon}</span>
      {logo.name && (
        <span className="select-none whitespace-nowrap text-[10px] font-medium tracking-wide text-neutral-400 dark:text-neutral-600 sm:text-[11px]">
          {logo.name}
        </span>
      )}
    </motion.div>
  );
}

export default function LogoCloudSwap({
  logos = DEFAULT_LOGOS,
  title = "Chosen by teams who sweat the details",
  subtitle = "Each of these replaced three tools with one.",
  interval = 3200,
  stagger = 0.11,
  className,
}: LogoCloudSwapProps) {
  const [waving, setWaving] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setWaving(true), interval);
    return () => clearInterval(id);
  }, [interval]);

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
              isWaving={waving}
              stagger={stagger}
              totalCount={logos.length}
              onDone={() => setWaving(false)}
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
              isWaving={waving}
              stagger={stagger}
              totalCount={logos.length}
              onDone={() => setWaving(false)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
