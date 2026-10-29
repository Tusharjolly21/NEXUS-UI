"use client";

/**
 * Motion Kit previews (batch 16): Pluck Frame.
 * It plays its own demo (autoplay) until a real pointer arrives, so the preview only adds the light page.
 */

import { PluckFrame } from "@/components/pluck-frame";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewPluckFrame({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[440px]" : "w-full max-w-[440px]"}>
        <PluckFrame autoplay />
      </div>
    </div>
  );
}
