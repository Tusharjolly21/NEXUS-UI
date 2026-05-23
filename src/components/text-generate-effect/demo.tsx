"use client";

import * as React from "react";
import { TextGenerateEffect } from "./text-generate-effect";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function TextGenerateEffectDemo() {
  const [charMode, setCharMode] = React.useState(false);

  return (
    <section className="mx-auto max-w-5xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Text animation</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Text Generate Effect
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Staggered text reveal for hero headings and paragraphs with word, character, or line animation modes.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Switch id="text-generate-char-mode" checked={charMode} onCheckedChange={setCharMode} />
        <Label htmlFor="text-generate-char-mode" className="text-xs text-muted-foreground">
          Character mode for hero line
        </Label>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card/60 p-6 shadow-sm dark:bg-white/[0.03]">
        <TextGenerateEffect
          as="h1"
          mode={charMode ? "character" : "word"}
          text="Build motion-first interfaces that feel alive."
          className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          duration={0.42}
          stagger={charMode ? 0.02 : 0.07}
          blur
          trigger="mount"
        />

        <TextGenerateEffect
          as="p"
          mode="word"
          text="A reusable reveal component for hero sections, landing pages, and product storytelling blocks."
          className="max-w-2xl text-base leading-relaxed text-muted-foreground"
          delay={0.22}
          duration={0.35}
          stagger={0.05}
          blur
          trigger="viewport"
        />

        <TextGenerateEffect
          as="div"
          mode="line"
          text={"Reveal line one.\nReveal line two.\nReveal line three."}
          className="font-medium text-foreground"
          delay={0.1}
          duration={0.4}
          stagger={0.12}
          blur={false}
          lift
          trigger="viewport"
        />
      </div>
    </section>
  );
}
