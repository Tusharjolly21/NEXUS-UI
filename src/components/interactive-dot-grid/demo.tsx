"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InteractiveDotGrid } from "./interactive-dot-grid";

export function InteractiveDotGridDemo() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Hero section */}
      <InteractiveDotGrid
        className="min-h-[600px]"
        dotSpacing={40}
        dotSize={1.5}
        dotColor="#4b5563"
        activeDotColor="#818cf8"
        interactionRadius={170}
        interactionStrength={0.55}
        mode="spotlight"
        fadeEdges
        showGradientOverlay
        title="Build interfaces that respond"
        subtitle="Interactive motion backgrounds and copy-paste components for modern React apps."
        primaryCTALabel="Browse Components"
        primaryCTAHref="/components"
        secondaryCTALabel="View Templates"
        secondaryCTAHref="/templates"
      />

      {/* Variant showcase */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {/* Repel mode */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Repel mode</p>
              <p className="mt-1 text-xs text-muted-foreground">Dots push away from cursor</p>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[10px] text-muted-foreground">
              interactive
            </span>
          </div>
          <InteractiveDotGrid
            className="h-72 w-full"
            dotSpacing={36}
            dotSize={1.5}
            dotColor="#374151"
            activeDotColor="#f472b6"
            interactionRadius={130}
            interactionStrength={0.6}
            mode="repel"
            fadeEdges
            showGradientOverlay={false}
          />
        </section>

        {/* Wave mode */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Wave mode</p>
              <p className="mt-1 text-xs text-muted-foreground">Ripple effect around cursor</p>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[10px] text-muted-foreground">
              interactive
            </span>
          </div>
          <InteractiveDotGrid
            className="h-72 w-full"
            dotSpacing={38}
            dotSize={1.5}
            dotColor="#374151"
            activeDotColor="#34d399"
            interactionRadius={140}
            interactionStrength={0.5}
            mode="wave"
            fadeEdges
            showGradientOverlay={false}
          />
        </section>

        {/* Static mode */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Static mode</p>
              <p className="mt-1 text-xs text-muted-foreground">Decorative grid, no interaction</p>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[10px] text-muted-foreground">
              decorative
            </span>
          </div>
          <InteractiveDotGrid
            className="h-72 w-full"
            dotSpacing={32}
            dotSize={1.5}
            dotColor="#4b5563"
            activeDotColor="#818cf8"
            interactionRadius={160}
            interactionStrength={0.5}
            mode="static"
            fadeEdges
            showGradientOverlay={false}
          />
        </section>

        {/* Attract mode */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Attract mode</p>
              <p className="mt-1 text-xs text-muted-foreground">Dots pull slightly toward cursor</p>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-[10px] text-muted-foreground">
              interactive
            </span>
          </div>
          <InteractiveDotGrid
            className="h-72 w-full"
            dotSpacing={36}
            dotSize={1.5}
            dotColor="#374151"
            activeDotColor="#fbbf24"
            interactionRadius={140}
            interactionStrength={0.5}
            mode="attract"
            fadeEdges
            showGradientOverlay={false}
          />
        </section>
      </div>

      {/* Feature callout */}
      <section className="mt-10 flex flex-col items-center gap-4 text-center">
        <Link
          href="/components"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-all hover:gap-3 hover:opacity-90"
        >
          Explore all components <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}