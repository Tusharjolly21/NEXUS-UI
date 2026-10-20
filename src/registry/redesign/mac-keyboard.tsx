"use client";

import { MacKeyboard } from "@/components/keyboard";

export function PreviewMacKeyboardRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[600px]">
        <MacKeyboard autoplay layout={compact ? "compact" : "mac"} enableSound={false} />
      </div>
    </div>
  );
}

export function PreviewMacKeyboardListenRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[640px]">
        <MacKeyboard listen theme="dark" layout={compact ? "compact" : "mac"} accent="#bf5af2" placeholder="Type on your keyboard..." />
      </div>
    </div>
  );
}
