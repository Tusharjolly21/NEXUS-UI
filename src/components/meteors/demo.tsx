"use client";

import * as React from "react";
import { Meteors } from "./meteors";

export function MeteorsDemo() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Backgrounds</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Meteor Effect
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Animated diagonal beams with glowing heads and trails, crafted for hero sections, cards, and pricing containers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-[#050911] p-8 text-white">
          <Meteors
            number={24}
            minDuration={2.8}
            maxDuration={5.8}
            angle={214}
            color="#93c5fd"
            intensity="high"
            className="absolute inset-0"
          />
          <div className="relative z-10 min-h-[300px]">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">Card example</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Conversion-focused pricing card</h2>
            <p className="mt-3 max-w-md text-sm text-slate-300/85">
              Keep foreground copy crisp while meteors animate softly in the background.
            </p>
          </div>
        </div>

        <Meteors
          number={30}
          minDelay={0.05}
          maxDelay={1.8}
          minDuration={2.8}
          maxDuration={5.8}
          angle={212}
          color="#93c5fd"
          intensity="high"
          glow
          className="relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-[#030712] p-8 text-white"
        >
          <div className="relative z-10 mx-auto max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">Hero background example</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Launch pages with cinematic motion depth
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/85">
              Use this effect as a reusable layer behind any section while preserving readability and interaction.
            </p>
          </div>
        </Meteors>
      </div>
    </section>
  );
}
