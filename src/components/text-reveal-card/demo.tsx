"use client";

import { TextRevealCard } from "./text-reveal-card";

/** Full-page demo used by /demos/text-reveal-card. */
export function TextRevealCardDemo() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-6xl flex-wrap items-center justify-center gap-6 px-4 py-10">
      <TextRevealCard title="Launch review" text="Most teams ship on a hunch." revealContent="Yours will ship on proof." autoplay />
      <TextRevealCard title="Portfolio" text="I design interfaces." revealContent="I design how they feel." intensity={1.6} />
    </section>
  );
}
