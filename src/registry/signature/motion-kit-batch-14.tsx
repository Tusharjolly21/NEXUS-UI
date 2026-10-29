"use client";

/**
 * Motion Kit previews (batch 14): Lightfall. A dark WebGL stage that plays its own demo (an invisible hand
 * drifts across the lanes and surges fire by themselves until a real pointer arrives), so the preview only
 * adds the light page around it.
 */

import { Lightfall } from "@/components/lightfall";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewLightfall({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[1000px]"}>
        <Lightfall
          height={compact ? 360 : 500}
          autoplay
          hint={compact ? undefined : "Move over it to part the light. Click, or press Space, to send a surge."}
        />
      </div>
    </div>
  );
}
