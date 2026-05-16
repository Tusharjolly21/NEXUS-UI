"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { AnimatedCountdown } from "./animated-countdown";

function futureDate(days: number, hours = 0, minutes = 0) {
  return new Date(Date.now() + (((days * 24 + hours) * 60 + minutes) * 60 * 1000));
}

export function AnimatedCountdownDemo() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-14">
      <header className="mx-auto max-w-2xl space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
          Countdown
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Animated countdown timer
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Real-time launch, event, sale, and campaign countdowns with animated number transitions.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Launching in
          </p>
          <AnimatedCountdown targetDate={futureDate(8, 4, 12)} variant="modern" size="lg" />
          <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
            Join waitlist <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
          <p className="mb-4 text-sm font-semibold text-foreground">Digital event</p>
          <AnimatedCountdown
            targetDate={futureDate(2, 16, 30)}
            variant="digital"
            size="md"
            showSeparators
          />
        </section>
        <section className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
          <p className="mb-4 text-sm font-semibold text-foreground">Minimal sale</p>
          <AnimatedCountdown
            targetDate={futureDate(0, 11, 42)}
            variant="minimal"
            showDays={false}
            size="md"
          />
        </section>
      </div>
    </div>
  );
}
