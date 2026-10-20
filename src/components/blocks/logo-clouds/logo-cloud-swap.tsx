"use client";
// Swap Animation: a fixed set of slots shows one page of marks at a time. Every `interval` ms the
// next page rolls in, slot by slot from left to right: the outgoing mark lifts away and blurs out
// while the incoming one rises into place on a spring. Pauses while off screen.

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
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
  /** How many marks are on screen at once. Defaults to 6. */
  slots?: number;
  className?: string;
};

const SPRING = { type: "spring" as const, stiffness: 400, damping: 32 };
const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

const DEFAULT_LOGOS: LogoEntry[] = LOGOS.map((l) => ({
  icon: <LogoLockup logo={l} className="text-[17px] sm:text-[19px]" />,
  id: l.name,
}));

function Slot({
  logo,
  page,
  delay,
  reduced,
}: {
  logo: LogoEntry;
  page: number;
  delay: number;
  reduced: boolean;
}) {
  const motionIn = reduced ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(6px)" };
  const motionOut = reduced ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(6px)" };

  return (
    <div className="relative flex h-16 w-full items-center justify-center overflow-hidden opacity-55 transition-opacity duration-300 ease-out hover:opacity-100">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${page}-${logo.id ?? logo.name ?? ""}`}
          role={logo.name ? "img" : undefined}
          aria-label={logo.name}
          initial={motionIn}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { ...SPRING, delay } }}
          exit={{ ...motionOut, transition: { ...SPRING, delay } }}
          className="flex cursor-default flex-col items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7]"
        >
          <span className="flex h-8 min-w-8 items-center justify-center">{logo.icon}</span>
          {logo.name ? (
            <span className="select-none whitespace-nowrap text-[12px] font-medium">{logo.name}</span>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function LogoCloudSwap({
  logos = DEFAULT_LOGOS,
  title = "Chosen by teams who sweat the details",
  subtitle = "Each of these replaced three tools with one.",
  interval = 3200,
  stagger = 0.08,
  slots = 6,
  className,
}: LogoCloudSwapProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = !!useReducedMotion();
  const [page, setPage] = React.useState(0);

  const slotCount = Math.max(1, Math.min(slots, logos.length));
  const pages = Math.max(1, Math.ceil(logos.length / slotCount));

  React.useEffect(() => {
    if (!inView || pages < 2) return;
    const id = window.setInterval(() => setPage((p) => p + 1), interval);
    return () => window.clearInterval(id);
  }, [inView, interval, pages]);

  const pageIndex = page % pages;

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={SOFT}
      >
        <h2 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[40px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">{subtitle}</p>
        ) : null}
      </motion.div>

      <div
        ref={ref}
        className={cn(
          "mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-4 sm:mt-14 sm:grid-cols-3 sm:gap-x-8",
          slotCount >= 6 && "lg:grid-cols-6",
        )}
      >
        {Array.from({ length: slotCount }, (_, i) => {
          const logo = logos[(pageIndex * slotCount + i) % logos.length];
          return <Slot key={i} logo={logo} page={page} delay={i * stagger} reduced={reduced} />;
        })}
      </div>
    </section>
  );
}
