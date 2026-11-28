"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function PreviewStarfieldHeroDeepSpace({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs", href: "#" }}
        particleCount={400}
        particleColor="#a78bfa"
        activeColor="#f0abfc"
        interactionRadius={180}
        speed={0.4}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}
