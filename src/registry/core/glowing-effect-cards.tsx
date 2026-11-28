"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export function PreviewGlowingEffectCards({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[520px] py-12",
      )}
    >
      <div
        className={cn(
          "w-full",
          compact ? "max-w-5xl scale-[0.78] origin-center" : "max-w-6xl",
        )}
      >
        <GlowingCardsLayout />
      </div>
    </div>
  );
}
