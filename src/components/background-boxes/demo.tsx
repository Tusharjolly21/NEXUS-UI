"use client";

import * as React from "react";
import { BackgroundBoxes } from "./background-boxes";

export function BackgroundBoxesDemo() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Backgrounds</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Background Boxes
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Full-width interactive box grid with subtle hover ripple, glow, and clean layering for foreground content.
        </p>
      </div>

      <BackgroundBoxes
        rows={14}
        columns={24}
        boxSize={24}
        highlightColor="hsl(210 100% 90% / 1)"
        defaultColor="hsl(222 55% 18% / 0.35)"
        borderColor="hsl(217 44% 29% / 0.62)"
        neighborRipple={false}
        animatePulse={false}
        gridClassName="origin-center scale-[1.18] rotate-[8deg] skew-x-[-7deg]"
        className="h-[560px] w-full overflow-hidden rounded-2xl border border-blue-950/70 bg-gradient-to-b from-[#070f2b] via-[#0a1740] to-[#081638]"
      >
        <div className="pointer-events-none mx-auto flex h-full w-full items-center justify-center px-10 text-center text-slate-100">
          <div data-bgboxes-content="true" className="pointer-events-auto inline-block max-w-2xl rounded-md px-2 py-1.5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">Background Boxes</p>
            <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tailwind is Awesome
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/85 sm:text-base">
              Hover only reacts on the grid area, not on text.
            </p>
          </div>
        </div>
      </BackgroundBoxes>
    </section>
  );
}
