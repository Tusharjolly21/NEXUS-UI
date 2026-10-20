"use client";

import { GlowingCard, GlowingCardsLayout } from "@/components/glowing-effect-cards";

export function PreviewGlowingEffectCardsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <GlowingCardsLayout autoplay hint={compact ? "" : undefined} className="max-w-[560px]" />
    </div>
  );
}

export function PreviewGlowingCardSingleRedesign() {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[300px]">
        <GlowingCard
          title="Cursor-reactive rim"
          description="The light follows your pointer round the edge and flares when you press."
          accent="#bf5af2"
          cta="Open details"
          glow={{ colors: ["#64d2ff", "#bf5af2", "#ff375f"], spread: 120, intensity: 1.4 }}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
