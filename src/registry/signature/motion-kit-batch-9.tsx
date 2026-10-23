"use client";

/**
 * Motion Kit batch 9 previews: a goo button that reaches for the cursor, a button that shoots webs, a
 * field that frosts over, an inbox that deletes into a black hole and a card that opens a portal.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over, so
 * the previews only add the stage around them.
 */

import { VenomButton } from "@/components/venom-button";
import { WebSlingButton } from "@/components/web-sling-button";
import { FrostInput } from "@/components/frost-input";
import { BlackHoleDelete } from "@/components/black-hole-delete";
import { PortalCard } from "@/components/portal-card";

export function PreviewVenomButton({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#ebeaee] p-6 sm:p-8 dark:bg-[#ebeaee]">
      <div className="w-full max-w-[720px]">
        <VenomButton autoplay height={360} />
      </div>
    </div>
  );
}

export function PreviewWebSlingButton({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#0a0b11] p-4 sm:p-6">
      <div className="w-full max-w-[720px]">
        <WebSlingButton autoplay height={420} />
      </div>
    </div>
  );
}

export function PreviewFrostInput({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#081624] p-4 sm:p-6">
      <div className="w-full max-w-[760px]">
        <FrostInput autoplay height={380} />
      </div>
    </div>
  );
}

const BLACK_HOLE_PREVIEW_MESSAGES = [
  { title: "Ava Chen", body: "Design review moved to Thursday at 3?", time: "9:41", color: "#5e5ce6" },
  { title: "Build bot", body: "Deploy failed: step 4 of 7 timed out", time: "9:12", color: "#ff9f0a" },
  { title: "Marco", body: "Lunch? Ramen again or somewhere new", time: "8:55", color: "#30d158" },
  { title: "Motion Weekly", body: "Twelve interfaces that move like physics", time: "8:20", color: "#64d2ff" },
];

export function PreviewBlackHoleDelete({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center bg-[#06070a] p-0">
      <BlackHoleDelete autoplay messages={BLACK_HOLE_PREVIEW_MESSAGES} height={430} className="rounded-none" />
    </div>
  );
}

export function PreviewPortalCard({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#15101b] p-5 sm:p-8">
      <div className="w-full max-w-[640px]">
        <PortalCard height={380} autoplay className="ring-1 ring-white/10" />
      </div>
    </div>
  );
}
