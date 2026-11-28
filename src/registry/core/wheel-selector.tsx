"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { WheelSelector } from "@/components/wheel-selector";

export function PreviewWheelSelector({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("w-full bg-[#080809] p-5", compact ? "min-h-[650px]" : "min-h-[730px] p-8")}>
      <WheelSelector
        className="mx-auto max-w-[1260px]"
        theme="obsidian"
        variant={compact ? "desktop" : "responsive"}
        contentMode="detailed"
        ringRadius={compact ? 168 : 186}
        tickCount={compact ? 32 : 48}
        autoRotate={compact}
        autoRotateInterval={3200}
        showCTA={false}
      />
    </div>
  );
}
