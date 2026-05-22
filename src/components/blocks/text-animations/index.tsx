"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code2, Layers3, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextAnimationBlurFadeIn } from "./text-animation-blur-fade-in";
import { TextAnimationFlippingWords } from "./text-animation-flipping-words";
import { TextAnimationTypewriterEffect } from "./text-animation-typewriter-effect";
import { TextGenerateTypewriter } from "./text-generate-typewriter";

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

const cardData = [
  {
    title: "Flipping Words",
    description: "Words swap with letter-blur and a morphing pill/dot accent.",
    icon: Sparkles,
  },
  {
    title: "Typewriter Effect",
    description: "Looping character-by-character copy for headings.",
    icon: Code2,
  },
  {
    title: "Blur Fade In",
    description: "Staggered word, line, or character entrances.",
    icon: Layers3,
  },
  {
    title: "Generate Typewriter",
    description: "AI-style typing with optional low-volume sound.",
    icon: Zap,
  },
];

export function TextAnimationsBlock({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-zinc-950 p-4 text-white sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/30 sm:p-6 lg:grid-cols-[0.88fr_1.12fr] lg:p-8">
          <div className="flex min-h-[420px] flex-col justify-between rounded-[1.5rem] border border-zinc-200 bg-[#f7f7f8] p-6 text-zinc-950 shadow-2xl shadow-black/20 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500/80">
                Text Animations
              </p>
              <TextAnimationFlippingWords
                prefix="Built with"
                words={["React", "TypeScript", "Tailwind", "Vite"]}
                dotColor="#18181b"
                className="mt-8 text-4xl text-zinc-950 sm:text-5xl lg:text-6xl"
              />
              <p className="mt-6 max-w-xl text-base leading-7 text-white/58 sm:text-lg">
                Create landing page copy that moves with intent: smooth reveal,
                typewriter, and generation-style text patterns.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              {["Hero pages", "SaaS sections", "Storytelling"].map((item) => (
                <span key={item} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewTile index={0}>
              <TextAnimationFlippingWords
                prefix="Built with"
                words={["React", "TypeScript", "Tailwind", "Vite"]}
                className="text-2xl text-white sm:text-3xl"
              />
            </PreviewTile>
            <PreviewTile index={1}>
              <TextAnimationTypewriterEffect
                texts={["Ship components.", "Write less CSS.", "Launch faster."]}
                delay={250}
                className="text-2xl text-white sm:text-3xl"
              />
            </PreviewTile>
            <PreviewTile index={2}>
              <PhoneMockup />
            </PreviewTile>
            <PreviewTile index={3}>
              <TextGenerateTypewriter
                text="Nexus-ui is preparing a polished section with animated copy, clear hierarchy, and production-ready motion."
                startOnView
                typingSpeed={48}
                className="min-h-[260px] rounded-2xl p-4"
              />
            </PreviewTile>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {cardData.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="grid size-10 place-items-center rounded-xl bg-white text-zinc-950">
                  <Icon className="size-4" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/54">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TextAnimationsBlockPreview() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-zinc-950">
      <div className="absolute left-1/2 top-1/2 w-[980px] -translate-x-1/2 -translate-y-1/2 scale-[0.45]">
        <TextAnimationsBlock className="min-h-[700px] overflow-hidden rounded-3xl p-6" />
      </div>
    </div>
  );
}

function PreviewTile({ children, index }: { children: React.ReactNode; index: number }) {
  const meta = cardData[index];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/15"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{meta.title}</p>
          <p className="mt-1 text-xs text-white/42">{meta.description}</p>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-200">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="flex flex-1 items-center">{children}</div>
    </motion.div>
  );
}

function PhoneMockup() {
  const items = [
    ["🚀", "Getting Started", "Build your first animation in minutes"],
    ["⚡", "Advanced Techniques", "Flip, blur, and generate with motion"],
    ["⚙️", "Performance Tips", "Keep renders smooth and responsive"],
  ];

  return (
    <div className="mx-auto w-full max-w-[190px] rounded-[2.2rem] border-[10px] border-black bg-white p-3 text-zinc-950 shadow-2xl">
      <div className="mx-auto mb-4 h-4 w-16 rounded-full bg-black" />
      <div className="space-y-3">
        {items.map(([icon, title, text], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2 + index * 0.18, duration: 0.55 }}
            className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg shadow-zinc-950/10"
          >
            <div className="flex gap-2">
              <span>{icon}</span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-1.5">
        <span className="h-1.5 w-6 rounded-full bg-blue-500" />
        <span className="size-1.5 rounded-full bg-zinc-300" />
        <span className="size-1.5 rounded-full bg-zinc-300" />
      </div>
    </div>
  );
}

export default TextAnimationsBlock;
