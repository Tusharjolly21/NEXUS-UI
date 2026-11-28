"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { TextRevealCard } from "@/components/text-reveal-card";

export function PreviewTextRevealCard({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[280px]" : "min-h-[420px] py-10",
      )}
    >
      <TextRevealCard
        title="Ship with confidence, not guesswork."
        description="Hover over the text area to see the magic."
        intensity={compact ? 1.05 : 1.2}
        className={cn(
          "w-full border-white/10 bg-[#070a14] text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.9)]",
          compact ? "max-w-xl" : "max-w-2xl",
        )}
        revealContent="I ship the final narrative"
        revealClassName={cn(
          "border-white/10 bg-gradient-to-t from-white/5 via-white/[0.02] to-transparent",
          compact
            ? "[&_p]:text-4xl [&_p]:font-semibold [&_p]:tracking-tight"
            : "[&_p]:text-6xl [&_p]:font-semibold [&_p]:tracking-tight",
        )}
      />
    </div>
  );
}
