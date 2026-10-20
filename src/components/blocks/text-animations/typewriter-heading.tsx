"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
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

const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

export function TypewriterHeading({
  text,
  description,
  typingSpeed = 82,
  startDelay = 350,
  className,
  cursorColor,
  loop = false,
  showCursor = true,
}: TypewriterHeadingProps) {
  const [index, setIndex] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [prevText, setPrevText] = React.useState(text);
  const reduceMotion = useReducedMotion();

  // a new headline starts over from the first letter (state adjusted during render, not in an effect)
  if (prevText !== text) {
    setPrevText(text);
    setIndex(0);
    setStarted(false);
  }

  const visibleText = reduceMotion ? text : text.slice(0, index);
  const done = reduceMotion || index >= text.length;
  const showCaret = showCursor && (started || !!reduceMotion);

  // wait out the start delay, then type
  React.useEffect(() => {
    if (started || reduceMotion) return;
    const timer = window.setTimeout(() => {
      setStarted(true);
      setRevealed(true);
    }, startDelay);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, startDelay, started]);

  React.useEffect(() => {
    if (!started || reduceMotion) return;

    if (index < text.length) {
      const char = text[index] ?? "";
      // a little unevenness reads as a person typing rather than a ticker
      const naturalDelay = typingSpeed + (index % 4) * 8 + (char === " " ? 24 : 0);
      const timer = window.setTimeout(() => setIndex((value) => Math.min(value + 1, text.length)), naturalDelay);
      return () => window.clearTimeout(timer);
    }

    if (!loop) return;

    // hold the finished line, then clear it; the start-delay effect above picks it up again
    const timer = window.setTimeout(() => {
      setIndex(0);
      setStarted(false);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [index, loop, reduceMotion, started, text, typingSpeed]);

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <h1
        aria-label={text}
        className="grid max-w-4xl text-left text-[44px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-6xl lg:text-7xl"
      >
        {/* Ghost copy reserves the final size so nothing below moves while typing */}
        <span className="invisible col-start-1 row-start-1 select-none" aria-hidden>
          {text}
          {showCursor ? <Caret color={cursorColor} blinking={false} /> : null}
        </span>
        <span aria-hidden className="col-start-1 row-start-1">
          {visibleText}
          {showCaret ? <Caret color={cursorColor} blinking={done} /> : null}
        </span>
      </h1>

      {description ? (
        <motion.p
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={revealed || reduceMotion ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(6px)" }}
          transition={{ ...SOFT, delay: 0.2 }}
          className="mt-5 max-w-2xl text-pretty text-left text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6] sm:text-[21px] sm:leading-[1.45]"
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}

/** Thin rounded caret. Solid while typing, a soft blink once the line is finished. */
function Caret({ color, blinking }: { color?: string; blinking: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      animate={blinking && !reduceMotion ? { opacity: [1, 1, 0, 0, 1] } : { opacity: 1 }}
      transition={
        blinking && !reduceMotion
          ? { duration: 1.05, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.55, 0.9, 1] }
          : { duration: 0.1 }
      }
      className={cn(
        "ml-[0.05em] inline-block h-[0.82em] w-[0.06em] min-w-[3px] translate-y-[0.1em] rounded-full",
        !color && "bg-[#0071e3] dark:bg-[#2997ff]",
      )}
      style={color ? { backgroundColor: color } : undefined}
    />
  );
}

export default TypewriterHeading;
