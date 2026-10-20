"use client";

import { AiCommandBar } from "@/components/forge-ai-command-bar";

export function PreviewForgeAiCommandBarRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className={compact ? "w-full max-w-[460px]" : "w-full max-w-[520px]"}>
        <AiCommandBar autoplay hotkey="" />
      </div>
    </div>
  );
}
