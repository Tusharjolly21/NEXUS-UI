"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { cn } from "@/lib/utils";
import { CinematicCardDeck } from "@/components/cinematic-card-deck";

export function PreviewCinematicCardDeck({ compact = true }: { compact?: boolean } = {}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const frameHeight = compact ? "420px" : "620px";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black",
        compact ? "h-[420px]" : "h-[620px]",
      )}
    >
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin]"
      >
        <CinematicCardDeck
          sectionHeight={compact ? 720 : 820}
          cardWidth={compact ? 360 : 500}
          cardHeight={compact ? 250 : 350}
          intensity="cinematic"
          smoothing={0.78}
          glowIntensity={0.22}
          scrollContainerRef={scrollRef}
          viewportHeight={frameHeight}
          className="min-h-full"
        />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
        Scroll inside preview
      </div>
    </div>
  );
}
