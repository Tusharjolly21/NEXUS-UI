"use client";

import { AskNexusInput } from "@/components/ask-nexus-input";

export function PreviewAskNexusInputRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <AskNexusInput autoplay className={compact ? "gap-6 py-2" : ""} />
    </div>
  );
}
