"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TextRevealCard } from "./text-reveal-card";

export function TextRevealCardDemo() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="flex w-full items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4">
        <TextRevealCard
          title="Ship with confidence, not guesswork."
          description="Hover over the text area to see the magic."
          intensity={1.05}
          className={cn(
            "w-full max-w-xl border-white/10 bg-[#070a14] text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.9)]",
          )}
          revealContent="I ship the final narrative"
          revealClassName={cn(
            "border-white/10 bg-gradient-to-t from-white/5 via-white/[0.02] to-transparent",
            "[&_p]:text-4xl [&_p]:font-semibold [&_p]:tracking-tight",
          )}
        />
      </div>
    </section>
  );
}
