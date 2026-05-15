"use client";

import * as React from "react";
import { TypewriterEffect } from "./typewriter-effect";

export function TypewriterEffectDemo() {
  const prefixText = "Ship delightful interfaces with ";
  const baseSpeed = 44;
  const accentDelay = prefixText.length * baseSpeed;

  return (
    <section className="mx-auto max-w-5xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Text animation</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Typewriter Effect
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Character-by-character typing animation with cursor, optional deleting, looping, and semantic typography.
        </p>
      </div>

      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5 py-10">
        <div className="flex w-full justify-center text-center">
          <h2 className="text-balance text-5xl font-semibold tracking-tight text-foreground lg:text-6xl">
            <TypewriterEffect
              as="span"
              text={prefixText}
              typingSpeed={baseSpeed}
              deletingSpeed={0}
              pauseDuration={1200}
              loop={false}
              showCursor={false}
            />
            <TypewriterEffect
              as="span"
              text="Nexus-UI"
              typingSpeed={54}
              deletingSpeed={0}
              delay={accentDelay}
              pauseDuration={1200}
              loop={false}
              className="text-primary"
              cursorClassName="bg-primary"
            />
          </h2>
        </div>
      </div>
    </section>
  );
}
