"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextAnimationBlurFadeInProps = {
  text: string;
  by?: "word" | "line" | "character";
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  repeat?: boolean;
  repeatDelay?: number;
  /** A word or phrase inside `text` to set in the accent blue (word and line modes). */
  highlight?: string;
  className?: string;
};

function splitText(text: string, by: NonNullable<TextAnimationBlurFadeInProps["by"]>) {
  if (by === "line") return text.split(/\n+/).filter(Boolean);
  if (by === "character") return Array.from(text);
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

const normalise = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();

const BASE =
  "max-w-3xl text-pretty text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[36px]";
const ACCENT = "text-[#0071e3] dark:text-[#2997ff]";

export function TextAnimationBlurFadeIn({
  text,
  by = "word",
  delay = 0,
  stagger = 0.035,
  duration = 0.55,
  once = true,
  repeat = false,
  repeatDelay = 1800,
  highlight,
  className,
}: TextAnimationBlurFadeInProps) {
  const rootRef = React.useRef<HTMLParagraphElement>(null);
  const inView = useInView(rootRef, { once, margin: "-80px" });
  const [phase, setPhase] = React.useState<"in" | "out" | "reset">("in");
  const pieces = React.useMemo(() => splitText(text, by), [by, text]);
  const reduceMotion = useReducedMotion();
  const visibleCount = pieces.filter((piece) => !/^\s+$/.test(piece)).length;
  const runDuration = delay * 1000 + visibleCount * stagger * 1000 + duration * 1000 + repeatDelay;
  const exitDuration = Math.min(visibleCount * 12, 360) + 320;

  // highlight: the words of the phrase, matched loosely so punctuation doesn't get in the way
  const highlightWords = React.useMemo(
    () => new Set(highlight ? normalise(highlight).split(/\s+/).filter(Boolean) : []),
    [highlight],
  );
  const isAccent = (piece: string) => {
    if (!highlight) return false;
    if (by === "line") return normalise(piece).includes(normalise(highlight));
    if (by === "word") return highlightWords.has(normalise(piece));
    return false;
  };

  // repeat: hold, blur the words away, snap them back to hidden, then run the next pass.
  // The paragraph is never remounted, so the in-view observer keeps watching the same node.
  React.useEffect(() => {
    if (!repeat || !inView || reduceMotion) return;
    const next = phase === "in" ? "out" : phase === "out" ? "reset" : "in";
    const wait = phase === "in" ? runDuration : phase === "out" ? exitDuration : 40;
    const timer = window.setTimeout(() => setPhase(next), wait);
    return () => window.clearTimeout(timer);
  }, [exitDuration, inView, phase, repeat, reduceMotion, runDuration]);

  if (reduceMotion) {
    return (
      <p ref={rootRef} className={cn(BASE, "whitespace-pre-line", className)}>
        {text}
      </p>
    );
  }

  const piece: Variants = {
    hidden: { opacity: 0, y: "0.35em", filter: "blur(8px)", transition: { duration: 0 } },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", duration, bounce: 0 } },
    out: { opacity: 0, y: "-0.2em", filter: "blur(6px)", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } },
  };

  return (
    <motion.p
      ref={rootRef}
      initial="hidden"
      animate={!inView || phase === "reset" ? "hidden" : phase === "out" ? "out" : "visible"}
      variants={{
        hidden: { transition: { staggerChildren: 0 } },
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
        out: { transition: { staggerChildren: Math.min(0.012, stagger) } },
      }}
      className={cn(BASE, className)}
    >
      {pieces.map((part, index) => {
        const isWhitespace = /^\s+$/.test(part);

        if (isWhitespace) {
          // keep the line breaks written into the text
          const breaks = part.split("\n").length - 1;
          return (
            <React.Fragment key={`${part}-${index}`}>
              {breaks > 0 ? Array.from({ length: breaks }, (_, i) => <br key={i} />) : part}
            </React.Fragment>
          );
        }

        return (
          <motion.span
            key={`${part}-${index}`}
            variants={piece}
            className={cn("inline-block will-change-transform", by === "line" && "block", isAccent(part) && ACCENT)}
          >
            {part}
          </motion.span>
        );
      })}
    </motion.p>
  );
}

export default TextAnimationBlurFadeIn;
