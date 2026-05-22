"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TypewriterHeadingProps = {
  text: string;
  description?: string;
  typingSpeed?: number;
  startDelay?: number;
  className?: string;
  cursorColor?: string;
  loop?: boolean;
  showCursor?: boolean;
};

export function TypewriterHeading({
  text,
  description,
  typingSpeed = 82,
  startDelay = 350,
  className,
  cursorColor = "#3B82F6",
  loop = false,
  showCursor = true,
}: TypewriterHeadingProps) {
  const [index, setIndex] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const visibleText = text.slice(0, index);
  const showDot = showCursor && started;

  React.useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setIndex(0);
      setStarted(false);
    }, 0);
    const startTimer = window.setTimeout(() => setStarted(true), startDelay);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(startTimer);
    };
  }, [startDelay, text]);

  React.useEffect(() => {
    if (!started) return;

    if (index < text.length) {
      const char = text[index] ?? "";
      const naturalDelay = typingSpeed + (index % 4) * 8 + (char === " " ? 24 : 0);
      const timer = window.setTimeout(() => {
        setIndex((value) => Math.min(value + 1, text.length));
      }, naturalDelay);

      return () => window.clearTimeout(timer);
    }

    if (!loop) return;

    const timer = window.setTimeout(() => {
      setIndex(0);
      setStarted(false);
      window.setTimeout(() => setStarted(true), startDelay);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [index, loop, startDelay, started, text, typingSpeed]);

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <h1 className="grid max-w-4xl text-left text-5xl font-black leading-[1.02] tracking-[-0.045em] text-zinc-950 sm:text-6xl lg:text-7xl">
        <span className="invisible col-start-1 row-start-1 select-none" aria-hidden>
          {text}
          {showCursor ? <CursorDot color={cursorColor} /> : null}
        </span>
        <span className="col-start-1 row-start-1">
          {visibleText}
          {showDot ? <CursorDot color={cursorColor} /> : null}
        </span>
      </h1>

      {description ? (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-3xl text-left text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9"
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}

function CursorDot({ color }: { color: string }) {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0.38, 1], scale: [1, 0.86, 1] }}
      transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
      className="ml-1.5 inline-block size-[0.18em] rounded-full align-baseline"
      style={{ backgroundColor: color }}
    />
  );
}

export default TypewriterHeading;
