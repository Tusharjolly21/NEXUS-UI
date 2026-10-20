"use client";

import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";

export function PreviewInteractiveGlobeExplorerRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <InteractiveGlobeExplorer autoplay className={compact ? "h-[340px] min-h-0 max-w-[620px]" : "h-[420px] max-w-[720px]"} />
    </div>
  );
}
