"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { DotGridHero } from "@/components/dot-grid-hero";

export function PreviewDotGridHero({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[280px]" : "h-[420px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "Learn more", href: "#" }}
        className="min-h-0 h-full"
      />
    </div>
  );
}
