"use client";

import { ScrollRevealButton } from "./scroll-reveal-button";

export function ScrollRevealButtonDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-14">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Buttons</p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Scroll Reveal Button
        </h2>
        <p className="text-sm text-muted-foreground">
          A download button that animates through icon → confirmation states before resetting.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
        <h2 className="text-sm font-semibold text-foreground">Default</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Click to trigger the scroll reveal state sequence.
        </p>
        <div className="mt-5 flex min-h-[160px] items-center justify-center rounded-xl border border-border/80 bg-muted/40 dark:bg-zinc-950/50">
          <ScrollRevealButton text="Download" confirmationText="Downloaded" />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
        <h2 className="text-sm font-semibold text-foreground">Custom labels</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Override text and confirmation message via props.
        </p>
        <div className="mt-5 flex min-h-[160px] items-center justify-center rounded-xl border border-border/80 bg-muted/40 dark:bg-zinc-950/50">
          <ScrollRevealButton text="Export CSV" confirmationText="Exported!" />
        </div>
      </section>
    </div>
  );
}
