"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextAnimationTypewriterEffectProps = {
  texts: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delay?: number;
  loop?: boolean;
  showCursor?: boolean;
  /** The caret. The default "|" draws a thin rounded caret in the accent blue; any other string renders as text. */
  cursor?: string;
  className?: string;
};

export function TextAnimationTypewriterEffect({
  texts,
  typingSpeed = 46,
  deletingSpeed = 24,
  delay = 1200,
  loop = true,
  showCursor = true,
  cursor = "|",
  className,
}: TextAnimationTypewriterEffectProps) {
  const entries = React.useMemo(() => {
    const list = Array.isArray(texts) ? texts : [texts];
    return list.filter(Boolean);
  }, [texts]);
  const [textIndex, setTextIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);
  const [ready, setReady] = React.useState(delay <= 0);
  const reduceMotion = useReducedMotion();
  const currentText = entries[textIndex] ?? "";
  // reduced motion: no typing, the first line simply stands
  const renderedText = reduceMotion ? (entries[0] ?? "") : currentText.slice(0, charIndex);
  // the caret holds solid while keys are moving and only blinks when the line is at rest
  const busy = ready && !reduceMotion && (deleting || charIndex < currentText.length);

  React.useEffect(() => {
    if (entries.length === 0 || reduceMotion) return;

    if (!ready) {
      const timer = window.setTimeout(() => setReady(true), delay);
      return () => window.clearTimeout(timer);
    }

    const isLastEntry = textIndex === entries.length - 1;

    if (!deleting && charIndex < currentText.length) {
      const timer = window.setTimeout(() => setCharIndex((value) => value + 1), typingSpeed);
      return () => window.clearTimeout(timer);
    }

    if (!deleting && charIndex === currentText.length) {
      if (entries.length === 1 && !loop) return;
      if (isLastEntry && !loop) return;
      const timer = window.setTimeout(() => setDeleting(true), delay);
      return () => window.clearTimeout(timer);
    }

    if (deleting && charIndex > 0) {
      const timer = window.setTimeout(() => setCharIndex((value) => value - 1), deletingSpeed);
      return () => window.clearTimeout(timer);
    }

    if (deleting && charIndex === 0) {
      const timer = window.setTimeout(() => {
        setDeleting(false);
        setTextIndex((value) => (value + 1) % entries.length);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [
    charIndex,
    currentText.length,
    delay,
    deleting,
    deletingSpeed,
    entries.length,
    loop,
    ready,
    reduceMotion,
    textIndex,
    typingSpeed,
  ]);

  return (
    <span
      className={cn(
        "inline-block min-h-[1.1em] whitespace-pre-wrap text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-4xl",
        className,
      )}
    >
      <span className="sr-only">{entries.join(" ")}</span>
      <span aria-hidden>{renderedText}</span>
      {showCursor && !reduceMotion ? (
        cursor === "|" ? (
          <motion.span
            aria-hidden
            animate={busy ? { opacity: 1 } : { opacity: [1, 1, 0, 0, 1] }}
            transition={busy ? { duration: 0.1 } : { duration: 1.05, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.55, 0.9, 1] }}
            className="ml-[0.06em] inline-block h-[0.9em] w-[0.07em] min-w-[2px] translate-y-[0.12em] rounded-full bg-[#0071e3] dark:bg-[#2997ff]"
          />
        ) : (
          <motion.span
            aria-hidden
            animate={busy ? { opacity: 1 } : { opacity: [1, 1, 0, 0, 1] }}
            transition={busy ? { duration: 0.1 } : { duration: 1.05, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.55, 0.9, 1] }}
            className="ml-1 inline-block text-[#0071e3] dark:text-[#2997ff]"
          >
            {cursor}
          </motion.span>
        )
      ) : null}
    </span>
  );
}

export default TextAnimationTypewriterEffect;
