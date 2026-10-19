"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TextAnimationBlurFadeIn } from "./text-animation-blur-fade-in";
import { TextAnimationFlippingWords } from "./text-animation-flipping-words";
import { TextAnimationTypewriterEffect } from "./text-animation-typewriter-effect";
import { TextGenerateTypewriter } from "./text-generate-typewriter";
import { TypewriterHeading } from "./typewriter-heading";

export { TextAnimationBlurFadeIn } from "./text-animation-blur-fade-in";
export type { TextAnimationBlurFadeInProps } from "./text-animation-blur-fade-in";
export { TextAnimationFlippingWords } from "./text-animation-flipping-words";
export type { TextAnimationFlippingWordsProps } from "./text-animation-flipping-words";
export { TextAnimationTypewriterEffect } from "./text-animation-typewriter-effect";
export type { TextAnimationTypewriterEffectProps } from "./text-animation-typewriter-effect";
export { TextGenerateTypewriter } from "./text-generate-typewriter";
export type { TextGenerateTypewriterProps } from "./text-generate-typewriter";
export { TypewriterHeading } from "./typewriter-heading";
export type { TypewriterHeadingProps } from "./typewriter-heading";

const SPECIMENS = [
  { title: "Flipping words", use: "Rotating the noun in a hero line." },
  { title: "Typewriter", use: "Cycling short claims under a headline." },
  { title: "Blur fade in", use: "Revealing a paragraph as it scrolls in." },
  { title: "Generate", use: "Streaming an assistant's answer, with optional key sounds." },
];

export function TextAnimationsBlock({ className, muteSound = false }: { className?: string; muteSound?: boolean }) {
  return (
    <section
      className={cn(
        "min-h-full w-full bg-[#f6f6f4] px-4 py-14 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 sm:py-20 lg:px-8",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <TextAnimationFlippingWords
            prefix="Copy that"
            words={["lands.", "moves.", "sells.", "sticks."]}
            dotColor="#ff5a36"
            className="text-[44px] leading-[1.02] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl"
          />
          <p className="max-w-sm text-pretty text-[15px] leading-6 text-zinc-600 dark:text-zinc-400 lg:pb-2">
            Four text treatments for headlines and paragraphs. Each one holds its layout while it animates and
            settles to plain text when reduced motion is on.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-14 md:grid-cols-2">
          <Specimen index={0}>
            <TextAnimationFlippingWords
              prefix="Ship it on"
              words={["Monday", "a Friday", "your terms"]}
              dotColor="#ff5a36"
              className="text-[28px] text-zinc-950 dark:text-white sm:text-4xl"
            />
          </Specimen>
          <Specimen index={1}>
            <TextAnimationTypewriterEffect
              texts={["Preview every branch.", "Roll back in one click.", "Sleep through deploys."]}
              delay={600}
              className="text-[22px] text-zinc-950 dark:text-white sm:text-[28px]"
            />
          </Specimen>
          <Specimen index={2}>
            <TextAnimationBlurFadeIn
              text="Good interfaces don't announce themselves. They answer the question you were about to ask, then get out of the way."
              stagger={0.03}
              once={false}
              repeat
              className="text-[19px] leading-[1.45] text-zinc-800 dark:text-zinc-200 sm:text-[22px]"
            />
          </Specimen>
          <Specimen index={3} flush>
            <TextGenerateTypewriter
              text="Your Q3 churn rose 1.8 points, almost entirely from annual plans that renewed in August. Most of those accounts never invited a second teammate."
              startOnView
              typingSpeed={34}
              muted={muteSound}
              className="h-full w-full rounded-[18px] border-0 shadow-none"
            />
          </Specimen>
        </div>
      </div>
    </section>
  );
}

export function TextAnimationsBlockPreview() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-[#f6f6f4]">
      <div data-tile-focus className="w-[640px] shrink-0">
        <p className="text-[15px] font-medium text-zinc-500">Changelog</p>
        <TypewriterHeading
          text="Release notes people read."
          description="Type out the headline, hold it, then let the summary settle in underneath."
          typingSpeed={70}
          startDelay={200}
          cursorColor="#ff5a36"
          loop
          className="mt-3"
        />
      </div>
    </div>
  );
}

function Specimen({ children, index, flush = false }: { children: React.ReactNode; index: number; flush?: boolean }) {
  const meta = SPECIMENS[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[260px] flex-col rounded-[22px] border border-zinc-200/80 bg-white p-2 dark:border-white/10 dark:bg-white/[0.03]"
    >
      <div className="flex items-baseline gap-3 px-3 pb-1 pt-3">
        <span className="font-mono text-[12px] text-zinc-400 dark:text-zinc-500">0{index + 1}</span>
        <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">{meta.title}</p>
        <p className="hidden truncate text-[13px] text-zinc-500 sm:block dark:text-zinc-400">{meta.use}</p>
      </div>
      <div className={cn("flex flex-1 items-center", flush ? "pt-2" : "px-4 pb-6 pt-4 sm:px-6")}>{children}</div>
    </motion.div>
  );
}

export default TextAnimationsBlock;
