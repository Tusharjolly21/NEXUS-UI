"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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

const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };

function useRise(): Variants {
  const reduced = useReducedMotion();
  return reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT },
      };
}

export function TextAnimationsBlock({ className }: { className?: string }) {
  const rise = useRise();

  return (
    <section
      className={cn(
        "min-h-full w-full bg-[#f5f5f7] px-4 py-16 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-6 sm:py-24 lg:px-8",
        className,
      )}
    >
      <motion.div
        className="mx-auto max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <motion.div variants={rise}>
            {/* The spectrum gradient is spent here, once, on the hero word */}
            <TextAnimationFlippingWords
              prefix="Copy that"
              words={["lands", "moves", "sells", "sticks"]}
              accent="spectrum"
              className="text-[44px] sm:text-6xl lg:text-7xl"
            />
          </motion.div>
          <motion.p
            variants={rise}
            className="max-w-sm text-pretty text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6] lg:pb-2"
          >
            Four text treatments for headlines and paragraphs. Each one holds its layout while it animates and
            settles to plain text when reduced motion is on.
          </motion.p>
        </div>

        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          className="mt-10 grid gap-3 sm:mt-14 sm:gap-4 md:grid-cols-2"
        >
          <Specimen index={0}>
            <TextAnimationFlippingWords
              prefix="Ship it on"
              words={["Monday", "a Friday", "your terms"]}
              className="text-[28px] sm:text-4xl"
            />
          </Specimen>
          <Specimen index={1}>
            <TextAnimationTypewriterEffect
              texts={["Preview every branch.", "Roll back in one click.", "Sleep through deploys."]}
              delay={600}
              className="text-[24px] sm:text-[30px]"
            />
          </Specimen>
          <Specimen index={2}>
            <TextAnimationBlurFadeIn
              text="Good interfaces don't announce themselves. They answer the question you were about to ask, then get out of the way."
              stagger={0.03}
              once={false}
              repeat
              highlight="get out of the way"
              className="text-[21px] leading-[1.35] sm:text-[24px]"
            />
          </Specimen>
          <Specimen index={3} flush>
            <TextGenerateTypewriter
              text="Your Q3 churn rose 1.8 points, almost entirely from annual plans that renewed in August. Most of those accounts never invited a second teammate."
              startOnView
              typingSpeed={34}
              className="h-full w-full rounded-[20px] bg-[#f5f5f7] shadow-none dark:bg-[#2c2c2e] dark:shadow-none"
            />
          </Specimen>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function TextAnimationsBlockPreview() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-[#f5f5f7] dark:bg-black">
      <div data-tile-focus className="w-[640px] shrink-0">
        <p className="text-[17px] font-semibold tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]">Changelog</p>
        <TypewriterHeading
          text="Release notes people read."
          description="Type out the headline, hold it, then let the summary settle in underneath."
          typingSpeed={70}
          startDelay={200}
          loop
          className="mt-3"
        />
      </div>
    </div>
  );
}

function Specimen({ children, index, flush = false }: { children: React.ReactNode; index: number; flush?: boolean }) {
  const meta = SPECIMENS[index];
  const rise = useRise();

  return (
    <motion.div
      variants={rise}
      className="flex min-h-[280px] flex-col rounded-[28px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.05)] transition-shadow duration-500 hover:shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
    >
      <div className="flex items-baseline gap-3 px-4 pb-1 pt-4">
        <p className="shrink-0 text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{meta.title}</p>
        <p className="hidden truncate text-[13px] text-[#86868b] dark:text-[#98989d] sm:block">{meta.use}</p>
      </div>
      <div className={cn("flex flex-1 items-center", flush ? "pt-2" : "px-4 pb-6 pt-4 sm:px-6")}>{children}</div>
    </motion.div>
  );
}

export default TextAnimationsBlock;
