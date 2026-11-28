"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { DotGridHero } from "@/components/dot-grid-hero";

export function PreviewDotGridHeroAmber({
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
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys automatically."
        primaryCTA={{ label: "Try it free", href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        background="#fafafa"
        dotGap={52}
        colors={["#f59e0b", "#f97316", "#ef4444", "#dc2626", "#fb923c"]}
        interactionRadius={100}
        repulsionStrength={6}
        springK={0.04}
        damping={0.85}
        className="min-h-0 h-full"
      />
    </div>
  );
}
