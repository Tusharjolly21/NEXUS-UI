"use client";

/**
 * Motion Kit previews (batch 19): Mercury Tabs. It plays itself (autoplay) until a real pointer arrives, so the
 * preview only adds a little room around it.
 */

import { MercuryTabs } from "@/components/mercury-tabs";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewMercuryTabs({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[440px]"}`}>
      <div className="w-full max-w-[720px]">
        <MercuryTabs autoplay />
      </div>
    </div>
  );
}
