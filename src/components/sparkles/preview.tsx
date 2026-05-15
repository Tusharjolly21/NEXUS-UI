"use client";

import * as React from "react";
import { Sparkles } from "./sparkles";

export function SparklesPreview() {
  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Effects</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Sparkles
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Configurable particle field for hero banners, cards, and decorative surfaces.
        </p>
      </div>

      {/* Hero text highlight example */}
      <div className="relative mx-auto aspect-[10/9] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-transparent p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute inset-0 bg-black" />
        <div className="relative z-[2] mx-auto max-w-2xl space-y-6 py-20 text-center">
          <h2 className="text-6xl font-semibold tracking-tight text-white sm:text-8xl">NEXUS-UI</h2>
          <div className="relative mx-auto w-fit">
            <div className="h-px w-72 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_26px_2px_rgba(59,130,246,0.65)]" />
            {/* Swarm band is anchored to line edge: starts exactly at top-full */}
            <div className="pointer-events-none absolute left-1/2 top-full z-[1] h-28 w-[19rem] -translate-x-1/2 -mt-px overflow-hidden">
              <Sparkles
                className="h-full w-full"
                count={200}
                density="high"
                color="#a8d7ff"
                minSize={0.7}
                maxSize={1.8}
                speed={1.15}
                opacity={0.95}
                direction="down"
                enableGlow
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card / standalone decoration example */}
      <div className="relative mx-auto aspect-[10/9] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-transparent p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute inset-0 bg-black" />
        <Sparkles
          background
          count={150}
          density="high"
          color="#f8fafc"
          minSize={0.9}
          maxSize={2.5}
          speed={0.85}
          opacity={1}
          direction="random"
          enableGlow
          interactive
        />
        <div className="relative mx-auto flex h-full min-h-[320px] items-center justify-center">
          <h3 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">Build great products</h3>
        </div>
      </div>
    </section>
  );
}
