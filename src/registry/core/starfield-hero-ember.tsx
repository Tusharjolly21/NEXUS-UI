"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function PreviewStarfieldHeroEmber({
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
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now", href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        particleCount={180}
        particleColor="#f59e0b"
        activeColor="#fef9c3"
        interactionRadius={160}
        speed={0.15}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}
