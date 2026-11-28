"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { DotGridHero } from "@/components/dot-grid-hero";

export function PreviewDotGridHeroRose({
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
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now", href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        background="#fff0f3"
        textColor="#1a0a10"
        dotGap={90}
        colors={["#f43f5e", "#e11d48", "#fb7185", "#fda4af", "#9f1239"]}
        interactionRadius={200}
        repulsionStrength={14}
        springK={0.09}
        damping={0.76}
        className="min-h-0 h-full"
      />
    </div>
  );
}
