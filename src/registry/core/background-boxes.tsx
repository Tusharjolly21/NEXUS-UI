"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { BackgroundBoxes } from "@/components/background-boxes";
import { cn } from "@/lib/utils";

export function PreviewBackgroundBoxes({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <BackgroundBoxes
      rows={80}
      cols={60}
      boxWidth={64}
      boxHeight={32}
      borderColor="#374151"
      showCrosses
      crossColor="#374151"
      className={cn(
        "w-full bg-zinc-950",
        compact ? "h-[420px]" : "h-[600px]",
      )}
    />
  );
}
