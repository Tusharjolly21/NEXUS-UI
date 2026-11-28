"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { DotGridHero } from "@/components/dot-grid-hero";

export function PreviewDotGridHeroDefault({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        subtitle="A motion-native component library for React. Animated, accessible, and production-ready out of the box."
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "Browse components", href: "#" }}
        className="min-h-0 h-full"
      />
    </div>
  );
}
