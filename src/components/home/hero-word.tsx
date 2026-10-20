"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RainbowWord, rainbowColor } from "@/components/site/rainbow-word";

/** What people build with the library; the headline cycles through them. */
const WORDS = ["landing page", "dashboard", "portfolio", "pricing page", "waitlist", "product tour"];
const HOLD_MS = 2600;
/** Let the first word's drop-in finish before cycling. */
const FIRST_HOLD_MS = 3400;

/**
 * "Make your ___ move." The first word is the server-rendered RainbowWord, so the headline
 * reads fine without JS. After that each word drops in letter by letter in the same spectrum.
 * Screen readers always get "landing page"; reduced motion keeps it still.
 */
export function HeroWord({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (delay: number) => {
      timer = setTimeout(() => {
        if (document.visibilityState === "visible") setIndex((i) => (i + 1) % WORDS.length);
        tick(HOLD_MS);
      }, delay);
    };
    tick(FIRST_HOLD_MS);
    return () => clearTimeout(timer);
  }, [reduce]);

  return (
    <span className={className}>
      <span className="sr-only">landing page</span>
      <span aria-hidden className="relative inline-flex justify-center whitespace-nowrap">
        <AnimatePresence mode="wait" initial={false}>
          {index === 0 ? (
            <motion.span key="w0" exit={{ opacity: 0, y: "-0.25em", filter: "blur(6px)" }} transition={{ duration: 0.22 }}>
              <RainbowWord>{WORDS[0]}</RainbowWord>
            </motion.span>
          ) : (
            <motion.span
              key={`w${index}`}
              exit={{ opacity: 0, y: "-0.25em", filter: "blur(6px)" }}
              transition={{ duration: 0.22 }}
            >
              <Letters word={WORDS[index]} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}

function Letters({ word }: { word: string }) {
  const chars = Array.from(word);
  const last = Math.max(1, chars.length - 1);
  return (
    <>
      {chars.map((char, i) =>
        char === " " ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            style={{ color: rainbowColor(i / last) }}
            initial={{ y: "-0.35em", opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: i * 0.035 }}
          >
            {char}
          </motion.span>
        ),
      )}
    </>
  );
}
