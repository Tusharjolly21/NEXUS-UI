"use client";
// Cursor Spotlight: a panel of twelve brands in a hairline grid. They sit dim and grey, and a soft
// light follows the pointer: inside it each lockup turns to full ink with its brand colour. The
// light chases the pointer on a spring. With `autoplay` it drifts along a slow figure-eight by
// itself until the first touch, and it stops drifting off screen.

import * as React from "react";
import { motion, useAnimationFrame, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { INK, LOGOS, LogoHeading, LogoLockup, type Logo } from "./logos";

export type LogoCloudSpotlightProps = {
  /** Brands in the grid: { name, Icon, color, wordmark? }. Defaults to twenty invented brands (the first twelve show). */
  logos?: Logo[];
  /** Headline above the panel. */
  title?: string;
  /** Line under the headline. Leave empty to hide it. */
  subtitle?: string;
  /** Radius of the light, in px. */
  radius?: number;
  /** Drifts the light along a figure-eight by itself until someone touches the panel. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

export default function LogoCloudSpotlight({
  logos = LOGOS,
  title = "Twelve partners, one integration standard.",
  subtitle = "Move across the grid to light up each partner.",
  radius = 200,
  autoplay = false,
  className,
}: LogoCloudSpotlightProps) {
  const reduced = !!useReducedMotion();
  const panel = React.useRef<HTMLDivElement>(null);
  const inView = useInView(panel);
  const touched = React.useRef(false);
  const pointerIn = React.useRef(false);
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const x = useSpring(mx, { stiffness: 220, damping: 28, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 28, mass: 0.6 });
  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${x}px ${y}px, black 0%, transparent 72%)`;
  const list = logos.slice(0, 12);

  useAnimationFrame((t) => {
    const el = panel.current;
    if (!el || pointerIn.current || !inView) return;
    if (!autoplay || reduced || touched.current) {
      mx.set(el.clientWidth / 2);
      my.set(el.clientHeight / 2);
      return;
    }
    // drift the light along a slow figure-eight so the panel demos itself
    mx.set(el.clientWidth * (0.5 + 0.38 * Math.sin(t / 1300)));
    my.set(el.clientHeight * (0.5 + 0.3 * Math.sin(t / 650)));
  });

  const grid = (lit: boolean) => (
    <div
      aria-hidden={lit ? true : undefined}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-black/[0.06] dark:bg-white/[0.08] sm:grid-cols-4"
    >
      {list.map((b) => (
        <div
          key={b.name}
          className={cn(
            "flex h-[84px] items-center justify-center bg-white dark:bg-[#1c1c1e]",
            lit ? INK : "text-[#1d1d1f]/30 dark:text-[#f5f5f7]/30",
          )}
        >
          <LogoLockup logo={b} tinted={lit} className="text-[16px] sm:text-[18px]" />
        </div>
      ))}
    </div>
  );

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)}>
      <LogoHeading title={title} subtitle={subtitle} />
      <div
        ref={panel}
        onMouseMove={(e) => {
          pointerIn.current = true;
          touched.current = true;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onMouseLeave={() => (pointerIn.current = false)}
        className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-[24px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] sm:mt-14"
      >
        {grid(false)}
        <motion.div className="pointer-events-none absolute inset-0 p-2" style={{ WebkitMaskImage: mask, maskImage: mask }}>
          {grid(true)}
        </motion.div>
      </div>
    </section>
  );
}
