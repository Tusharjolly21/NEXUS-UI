"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextAnimationTypewriterEffectProps = {
  texts: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delay?: number;
  loop?: boolean;
  showCursor?: boolean;
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
  const currentText = entries[textIndex] ?? "";
  const renderedText = currentText.slice(0, charIndex);

  React.useEffect(() => {
    if (entries.length === 0) return;

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
    textIndex,
    typingSpeed,
  ]);

  return (
    <span
      className={cn(
        "inline-flex min-h-[1.18em] items-baseline whitespace-pre-wrap font-mono text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl",
        className,
      )}
    >
      <span>{renderedText}</span>
      {showCursor && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 1, 0, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="ml-1 inline-block text-blue-500"
        >
          {cursor}
        </motion.span>
      )}
    </span>
  );
}

export default TextAnimationTypewriterEffect;
