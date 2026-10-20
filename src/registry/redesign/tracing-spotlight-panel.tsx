"use client";

import { TracingSpotlightPanel } from "@/components/tracing-spotlight-panel";

export function PreviewTracingSpotlightPanelRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <TracingSpotlightPanel autoplay className={compact ? "max-w-[300px]" : "max-w-[320px]"} />
      <p className="m-0 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Move inside, then leave and watch the edge.</p>
    </div>
  );
}
