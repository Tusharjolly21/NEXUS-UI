"use client";
// Blur Hover Reveal: twelve brands rest in a quiet grid. Hover a name (or tab to it) and it comes
// into focus, scaling up and taking its brand colour, while the others recede and blur. With
// `autoplay` the focus walks the grid by itself until the first touch.

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { INK, LOGOS, LogoHeading, LogoLockup, SPRING, type Logo } from "./logos";

export type LogoCloudBlurProps = {
  /** Brands in the grid: { name, Icon, color, wordmark? }. Defaults to twenty invented brands. */
  logos?: Logo[];
  /** Headline above the grid. */
  title?: string;
  /** Line under the headline. Leave empty to hide it. */
  subtitle?: string;
  /** How many marks to show, taken from the start of `logos` (1 to 12). */
  count?: number;
  /** Opacity of the other marks while one is focused. */
  recedeOpacity?: number;
  /** Blur in px on the other marks while one is focused. */
  recedeBlur?: number;
  /** Scale of the focused mark. */
  hoverScale?: number;
  /** Moves the focus along the grid by itself until someone touches it. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

export default function LogoCloudBlur({
  logos = LOGOS,
  title = "The teams behind the products you open every morning.",
  subtitle = "Hover a name to bring it into focus.",
  count = 12,
  recedeOpacity = 0.25,
  recedeBlur = 3,
  hoverScale = 1.08,
  autoplay = false,
  className,
}: LogoCloudBlurProps) {
  const reduced = !!useReducedMotion();
  const ref = React.useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const touched = React.useRef(false);
  const [focus, setFocus] = React.useState<number | null>(null);
  const list = logos.slice(0, Math.max(1, Math.min(12, count)));

  React.useEffect(() => {
    if (!autoplay || reduced || !inView) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      k = (k + 5) % list.length;
      setFocus(k % 3 === 2 ? null : k);
    }, 1200);
    return () => window.clearInterval(id);
  }, [autoplay, reduced, inView, list.length]);

  const touch = () => (touched.current = true);

  return (
    <section className={cn("w-full bg-white px-4 py-16 dark:bg-black sm:py-24", className)} onPointerDown={touch} onPointerMove={touch}>
      <LogoHeading title={title} subtitle={subtitle} />
      <ul
        ref={ref}
        onMouseLeave={() => setFocus(null)}
        className="m-0 mx-auto mt-12 grid max-w-3xl list-none grid-cols-2 place-items-center gap-x-6 gap-y-8 p-0 sm:mt-14 sm:grid-cols-4"
      >
        {list.map((b, i) => {
          const state = focus === null ? "rest" : focus === i ? "focus" : "recede";
          return (
            <li key={b.name}>
              <motion.div
                tabIndex={0}
                aria-label={b.name}
                onHoverStart={() => setFocus(i)}
                onFocus={() => setFocus(i)}
                onBlur={() => setFocus(null)}
                animate={state}
                initial={false}
                variants={{
                  rest: { opacity: 0.8, scale: 1, filter: "blur(0px)" },
                  focus: { opacity: 1, scale: reduced ? 1 : hoverScale, filter: "blur(0px)" },
                  recede: { opacity: recedeOpacity, scale: reduced ? 1 : 0.97, filter: reduced ? "blur(0px)" : `blur(${recedeBlur}px)` },
                }}
                transition={SPRING}
                className={cn("flex cursor-default rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-black", INK)}
              >
                <LogoLockup logo={b} tinted={focus === i} className="text-[19px] sm:text-[21px]" />
              </motion.div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
