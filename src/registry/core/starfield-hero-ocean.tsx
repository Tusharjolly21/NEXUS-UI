"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function PreviewStarfieldHeroOcean({
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
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
        primaryCTA={{ label: "Try it free", href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        particleColor="#22d3ee"
        activeColor="#ecfeff"
        interactionRadius={120}
        speed={0.8}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}
