"use client";

import * as React from "react";
import { BackgroundBoxes } from "./background-boxes";

export function BackgroundBoxesDemo() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Backgrounds</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Background Boxes
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Isometric animated grid with hover color effects and cross markers.
        </p>
      </div>

      <BackgroundBoxes
        rows={80}
        cols={60}
        boxWidth={64}
        boxHeight={32}
        borderColor="#374151"
        showCrosses
        crossColor="#374151"
        className="h-140 w-full rounded-2xl border border-zinc-800 bg-zinc-950"
      />
    </section>
  );
}
