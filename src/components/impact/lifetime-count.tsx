"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { SNAPSHOT, compact, estimateLifetime } from "@/lib/twenty-first-stats";

/**
 * A lifetime count as 21st writes it ("938.7K", "1.01M"). The server renders the last counted value; once the page is
 * open it rolls up to today's estimate (see estimateLifetime). Reduced motion jumps straight to it.
 */
export function LifetimeCount({ kind, className }: { kind: "views" | "bookmarks"; className?: string }) {
  const still = !!useReducedMotion();
  const value = useMotionValue(SNAPSHOT[kind]);
  const text = useTransform(value, (n) => {
    const { digits, suffix } = compact(n);
    return digits + suffix;
  });

  useEffect(() => {
    const target = estimateLifetime()[kind];
    if (still) {
      value.set(target);
      return;
    }
    const controls = animate(value, target, { duration: 1.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 });
    return () => controls.stop();
  }, [kind, still, value]);

  return <motion.span className={className}>{text}</motion.span>;
}
