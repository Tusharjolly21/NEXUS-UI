"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

const fmt = new Intl.NumberFormat("en-US");

/**
 * A number that counts up from 0 to `to` the first time it scrolls into view. Screen readers get the final
 * number straight away; reduced motion shows it without counting.
 */
export function CountUp({ to, prefix = "", className }: { to: number; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const still = !!useReducedMotion();
  const value = useMotionValue(still ? to : 0);
  const text = useTransform(value, (n) => `${prefix}${fmt.format(Math.round(n))}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.8, ease: [0.2, 0.8, 0.2, 1] });
    return () => controls.stop();
  }, [inView, to, value]);

  return (
    <>
      <span className="sr-only">
        {prefix}
        {fmt.format(to)}
      </span>
      <motion.span ref={ref} aria-hidden className={className}>
        {text}
      </motion.span>
    </>
  );
}
