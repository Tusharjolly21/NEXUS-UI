"use client";

import { StatefulButton } from "@/components/stateful-button";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function PreviewStatefulButtonRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-4 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <StatefulButton size={compact ? "md" : "lg"} onClick={() => wait(1400)} loadingText="Publishing" successText="Published" autoplay>
        Publish post
      </StatefulButton>
      <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Press it. The label and width follow the promise.</span>
    </div>
  );
}
