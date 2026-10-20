"use client";

import * as React from "react";
import { GooeyInput } from "./gooey-input";

/**
 * Centered playground for {@link GooeyInput}: default, controlled, disabled, and open-state readout.
 */
export function GooeyInputDemo() {
  const [controlled, setControlled] = React.useState("");
  const [defaultOpen, setDefaultOpen] = React.useState("collapsed");
  const [controlledOpen, setControlledOpen] = React.useState("collapsed");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-16 px-4 py-20 sm:px-6">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Motion + SVG filter
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Gooey search input
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Collapsed pill expands on focus; the search icon sits in a detached bubble and merges with the field through
          a gooey blur. Click the bubble or tab into the field to try it.
        </p>
      </header>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Default</p>
        <GooeyInput
          className="justify-center"
          onOpenChange={(o) => setDefaultOpen(o ? "expanded" : "collapsed")}
        />
        <p className="text-xs text-muted-foreground">
          Open state: <span className="font-mono text-foreground">{defaultOpen}</span>
        </p>
      </section>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Controlled</p>
        <GooeyInput
          placeholder="Filter…"
          value={controlled}
          onValueChange={setControlled}
          collapsedWidth={100}
          expandedWidth={260}
          expandedOffset={56}
          gooeyBlur={6}
          className="justify-center"
          onOpenChange={(o) => setControlledOpen(o ? "expanded" : "collapsed")}
        />
        <p className="max-w-md text-center text-xs text-muted-foreground">
          Open state:{" "}
          <span className="font-mono text-foreground">{controlledOpen}</span>
          <br />
          Value:{" "}
          <span className="font-mono text-foreground">
            {(controlled ?? "").length ? JSON.stringify(controlled) : "(empty)"}
          </span>
        </p>
      </section>

      <section className="flex flex-col items-center gap-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Disabled</p>
        <GooeyInput disabled placeholder="Unavailable…" className="justify-center" />
      </section>
    </div>
  );
}
