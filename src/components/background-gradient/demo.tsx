"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { BackgroundGradient } from "./background-gradient";

export function BackgroundGradientDemo() {
  return (
    <section className="mx-auto max-w-5xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Backgrounds</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Background Gradient
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Animated gradient wrapper for cards, buttons, and hero sections with subtle glow and motion.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BackgroundGradient
          as="section"
          className="w-full"
          containerClassName="rounded-[inherit] p-6"
          colors={["#22d3ee", "#6366f1", "#a855f7", "#ec4899"]}
          animationSpeed={1}
          blur={26}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Card example</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Ship premium SaaS UI faster</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A reusable animated gradient background that keeps content readable in both light and dark themes.
          </p>
        </BackgroundGradient>

        <div className="flex flex-col gap-4">
          <BackgroundGradient
            as="button"
            className="w-fit"
            containerClassName="inline-flex items-center gap-2 rounded-[inherit] px-5 py-2.5 text-sm font-medium text-foreground"
            colors={["#06b6d4", "#3b82f6", "#8b5cf6"]}
            animationSpeed={1.2}
            blur={18}
          >
            Get started
            <ArrowRight className="size-4" />
          </BackgroundGradient>

          <BackgroundGradient
            as="section"
            className="w-full"
            containerClassName="rounded-[inherit] px-5 py-6"
            colors={["#14b8a6", "#2563eb", "#7c3aed", "#db2777"]}
            animationSpeed={0.8}
            blur={30}
            interactive
          >
            <h3 className="text-lg font-semibold text-foreground">Hero background example</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Move your cursor here to see interactive glow intensity.
            </p>
          </BackgroundGradient>
        </div>
      </div>
    </section>
  );
}
