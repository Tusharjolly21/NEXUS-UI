"use client";

import * as React from "react";
import { GlowingCardsLayout } from "./GlowingCardsLayout";

export function GlowingEffectCardsDemo() {
  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Cards</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Glowing Effect Cards
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Cursor-reactive glowing borders with a responsive 2-1-2 layout designed for premium SaaS interfaces.
        </p>
      </div>

      <GlowingCardsLayout />
    </section>
  );
}
