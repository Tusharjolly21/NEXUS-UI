"use client";

import { GooeyInput } from "@/components/gooey-input";

const SUGGESTIONS = ["Motion kit", "Motion values", "Spring motion", "Layout animation", "Scroll reveal", "Magnetic button", "Gooey filter"];

export function PreviewGooeySearchInputRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-start gap-4 p-8 pt-[22%] text-[#1d1d1f] dark:text-[#f5f5f7]">
      <GooeyInput
        placeholder="Search components"
        collapsedWidth={128}
        expandedWidth={compact ? 220 : 248}
        expandedOffset={56}
        suggestions={SUGGESTIONS}
        autoplay
      />
      <span className="absolute bottom-8 text-[12px] text-[#86868b] dark:text-[#98989d]">Click the pill, then type &ldquo;mo&rdquo;.</span>
    </div>
  );
}
