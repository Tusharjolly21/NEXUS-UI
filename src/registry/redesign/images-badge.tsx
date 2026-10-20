"use client";

import { ImagesBadge } from "@/components/images-badge";

const TEAM = [
  { alt: "Ava Chen" },
  { alt: "Noah Park" },
  { alt: "Mira Shah" },
  { alt: "Leo Grant" },
  { alt: "Zoe Ito" },
  { alt: "Kai Moss" },
  { alt: "Sam Reyes" },
  { alt: "Iris Vale" },
];

export function PreviewImagesBadgeRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex flex-col items-center gap-10">
        <ImagesBadge images={TEAM} maxVisible={3} revealCount={3} label="Editing now" size={compact ? "md" : "lg"} autoplay />
        <ImagesBadge images={TEAM.slice(2)} maxVisible={4} revealCount={1} label="12k builders" size="sm" shape="rounded" />
        <span className="-mt-4 text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Hover a badge, then the faces.</span>
      </div>
    </div>
  );
}
