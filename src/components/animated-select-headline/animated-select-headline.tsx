"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedSelectHeadlineProps {
  words?: string[];
  prefix?: string;
  suffix?: string;
  interval?: number;
  className?: string;
  headingClassName?: string;
}

const ACCENT_GRADIENTS = [
  "bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent",
  "bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent",
];

export function AnimatedSelectHeadline({
  words = ["warp speed", "pure flow", "light speed"],
  prefix = "Build amazing websites at",
  suffix,
  interval = 2500,
  className,
  headingClassName,
}: AnimatedSelectHeadlineProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      interval,
    );
    return () => clearInterval(id);
  }, [words.length, interval]);

  // Last two words get an accent color treatment.
  const accentStart = Math.max(words.length - 2, 0);
  const isAccent = index >= accentStart;
  const accentClass = isAccent
    ? ACCENT_GRADIENTS[index - accentStart]
    : undefined;

  return (
    <div className={cn("text-center", className)}>
      <h2
        className={cn(
          "text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl",
          headingClassName,
        )}
      >
        {prefix && <>{prefix} </>}
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("relative inline-block font-bold", accentClass)}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
        {suffix && <> {suffix}</>}
      </h2>
    </div>
  );
}
