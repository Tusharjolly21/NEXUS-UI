"use client";

import { TextRevealCard } from "@/components/text-reveal-card";

function Spark() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="text-[#0071e3] dark:text-[#0a84ff]">
      <path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z" fill="currentColor" />
    </svg>
  );
}

export function PreviewTextRevealCardRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <TextRevealCard
        autoplay
        icon={<Spark />}
        title="Launch review"
        text="Most teams ship on a hunch."
        revealContent="Yours will ship on proof."
        className={compact ? "max-w-[400px]" : "max-w-[440px]"}
      />
    </div>
  );
}
