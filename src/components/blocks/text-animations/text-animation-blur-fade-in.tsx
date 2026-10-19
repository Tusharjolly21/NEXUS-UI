"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
  className?: string;
};

function splitText(text: string, by: NonNullable<TextAnimationBlurFadeInProps["by"]>) {
  if (by === "line") return text.split(/\n+/).filter(Boolean);
  if (by === "character") return Array.from(text);
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

export function TextAnimationBlurFadeIn({
  text,
  by = "word",
  delay = 0,
  stagger = 0.035,
  duration = 0.55,
  once = true,
  repeat = false,
  repeatDelay = 1800,
  className,
}: TextAnimationBlurFadeInProps) {
  const rootRef = React.useRef<HTMLParagraphElement>(null);
  const inView = useInView(rootRef, { once, margin: "-80px" });
  const [cycle, setCycle] = React.useState(0);
  const pieces = React.useMemo(() => splitText(text, by), [by, text]);
  const reduceMotion = useReducedMotion();
  const runDuration = delay * 1000 + pieces.length * stagger * 1000 + duration * 1000 + repeatDelay;

  React.useEffect(() => {
    if (!repeat || !inView || reduceMotion) return;
    const timer = window.setTimeout(() => setCycle((value) => value + 1), runDuration);
    return () => window.clearTimeout(timer);
  }, [inView, repeat, runDuration, cycle, reduceMotion]);

  if (reduceMotion) {
    return (
      <p
        ref={rootRef}
        className={cn(
          "max-w-3xl whitespace-pre-line text-pretty text-2xl font-medium leading-relaxed text-zinc-700 dark:text-zinc-200 sm:text-3xl",
          className,
        )}
      >
        {text}
      </p>
    );
  }

  return (
    <motion.p
      key={cycle}
      ref={rootRef}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      className={cn(
        "max-w-3xl text-pretty text-2xl font-medium leading-relaxed text-zinc-700 dark:text-zinc-200 sm:text-3xl",
        className,
      )}
    >
      {pieces.map((piece, index) => {
        const isWhitespace = /^\s+$/.test(piece);

        if (isWhitespace) {
          // keep the line breaks written into the text
          const breaks = piece.split("\n").length - 1;
          return (
            <React.Fragment key={`${piece}-${index}`}>
              {breaks > 0 ? Array.from({ length: breaks }, (_, i) => <br key={i} />) : piece}
            </React.Fragment>
          );
        }

        return (
          <motion.span
            key={`${piece}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 12, filter: "blur(10px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "inline-block will-change-transform",
              by === "line" && "block",
            )}
          >
            {piece}
            {by === "line" && index < pieces.length - 1 ? <br /> : null}
          </motion.span>
        );
      })}
    </motion.p>
  );
}

export default TextAnimationBlurFadeIn;
