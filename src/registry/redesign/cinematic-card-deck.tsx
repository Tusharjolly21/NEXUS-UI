"use client";

import { CinematicCardDeck } from "@/components/cinematic-card-deck";

export function PreviewCinematicCardDeckRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <CinematicCardDeck autoplay intensity="cinematic" cardWidth={compact ? 320 : 360} cardHeight={compact ? 206 : 230} />
    </div>
  );
}
