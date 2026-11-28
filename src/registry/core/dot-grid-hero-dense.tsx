"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { DotGridHero } from "@/components/dot-grid-hero";

export function PreviewDotGridHeroDense({
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
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build fast, beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs", href: "#" }}
        background="#09090b"
        textColor="#fafafa"
        dotGap={80}
        colors={["#818cf8", "#6366f1", "#a78bfa", "#38bdf8", "#f472b6"]}
        interactionRadius={160}
        repulsionStrength={10}
        springK={0.055}
        damping={0.78}
        className="min-h-0 h-full"
      />
    </div>
  );
}
