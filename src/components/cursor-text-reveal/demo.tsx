"use client";

import { CursorTextReveal } from "./cursor-text-reveal";

/** Full-page demo used by /demos/cursor-text-reveal. */
export function CursorTextRevealDemo() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <CursorTextReveal baseText="The first rule of motion is clarity." revealText="The second rule is feeling." autoplay />
      <CursorTextReveal
        mode="image"
        baseText="We chase moments to feel alive."
        revealText="We keep the ones we usually miss."
        maskSize={150}
      />
    </section>
  );
}
