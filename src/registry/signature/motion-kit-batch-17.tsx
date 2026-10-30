"use client";

/**
 * Motion Kit previews (batch 17): AI Composer.
 * It types and sends its own suggestions (autoplay) until a real pointer arrives, so the preview only
 * adds the light page and room above the box for the thread and for the + menu to open upward.
 */

import { AIComposer } from "@/components/ai-composer";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewAiComposer({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[500px]" : "min-h-[540px]"}`}>
      <div className="w-full max-w-[560px]">
        <AIComposer autoplay />
      </div>
    </div>
  );
}
