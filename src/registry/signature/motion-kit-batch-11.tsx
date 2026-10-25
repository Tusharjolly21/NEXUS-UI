"use client";

/**
 * Motion Kit batch 11 previews: Dart Rating, Domino Progress, Pumpkin Reveal and Catch Undo. Each card
 * plays its own demo (a ghost pointer that stops as soon as a real one moves in), so the preview only
 * adds a light stage around it.
 */

import { DartRating } from "@/components/dart-rating";
import { DominoProgress } from "@/components/domino-progress";
import { PumpkinReveal } from "@/components/pumpkin-reveal";
import { CatchUndo } from "@/components/catch-undo";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewDartRating({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[520px]`}>
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <DartRating autoplay />
      </div>
    </div>
  );
}

export function PreviewDominoProgress({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[400px]`}>
      <div className={compact ? "w-full max-w-[480px]" : "w-full max-w-[560px]"}>
        <DominoProgress autoplay />
      </div>
    </div>
  );
}

export function PreviewPumpkinReveal({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[540px]`}>
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <PumpkinReveal autoplay />
      </div>
    </div>
  );
}

export function PreviewCatchUndo({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[580px]`}>
      <div className="w-full max-w-[720px]">
        <CatchUndo autoplay height={compact ? 520 : 560} />
      </div>
    </div>
  );
}
