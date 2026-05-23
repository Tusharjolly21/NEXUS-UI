"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { StatefulButton } from "./stateful-button";

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function StatefulButtonDemo() {
  async function handleAsyncAction() {
    await sleep(1400);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-14">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Buttons</p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Stateful button
        </h2>
        <p className="text-sm text-muted-foreground">
          Three states (idle, loading, success) with optional error handling and reset timing.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm dark:bg-white/[0.03]">
        <h2 className="text-sm font-semibold text-foreground">Animated state sequence</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Same label across states; only icon transitions from idle to loading spinner to success check.
        </p>
        <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-xl border border-border/80 bg-muted/40 dark:bg-zinc-950/50">
          <StatefulButton
            onClick={handleAsyncAction}
            loadingText="Send message"
            successText="Send message"
            className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black"
            successIcon={<CheckCircle2 className="size-4" />}
            resetDelay={1600}
          >
            Send message
          </StatefulButton>
        </div>
      </section>
    </div>
  );
}
