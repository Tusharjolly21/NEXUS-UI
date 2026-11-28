"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { usePhysicalKeyboard, MacKeyboard } from "@/components/keyboard";
import { cn } from "@/lib/utils";

export function PreviewKeyboard({
  compact = true,
}: { compact?: boolean } = {}) {
  const physical = usePhysicalKeyboard();
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "p-2 sm:p-4" : "p-6",
      )}
    >
      <MacKeyboard
        layout="mac"
        enableSound
        volume={0.5}
        soundType="mechanical"
        activeKeys={physical}
        showFunctionRow={!compact}
        theme="dark"
      />
    </div>
  );
}
