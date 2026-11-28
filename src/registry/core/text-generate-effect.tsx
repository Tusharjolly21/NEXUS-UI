"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { TextGenerateEffect } from "@/components/text-generate-effect";

export function PreviewTextGenerateEffect({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5",
        compact ? "min-h-[190px]" : "min-h-[280px] py-10",
      )}
    >
      <div className="max-w-3xl text-center">
        <TextGenerateEffect
          as="h2"
          mode={compact ? "word" : "character"}
          text="Build elegant interfaces that feel alive, readable, and deeply polished from the very first impression."
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            compact ? "text-3xl" : "text-5xl lg:text-6xl",
          )}
          duration={0.4}
          stagger={compact ? 0.065 : 0.02}
          blur
        />
      </div>
    </div>
  );
}
