"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function PreviewStarfieldHero({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[280px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Ship faster.\nBuild better."}
        subtitle="A motion-native component library for React — animated, accessible, and production-ready."
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "View components", href: "#" }}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}
