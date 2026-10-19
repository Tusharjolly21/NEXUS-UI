"use client";

import * as React from "react";
import { DynamicIsland, type IslandState } from "@/components/dynamic-island";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";
import { cn } from "@/lib/utils";

const OPTIONS: { value: IslandState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "timer", label: "Timer" },
  { value: "music", label: "Music" },
  { value: "call", label: "Call" },
];

// Positions are fractions of the fixed 420×300 stage below.
const SCRIPT: DemoStep[] = [
  { x: 0.5, y: 0.14, ms: 700, wait: 250, action: "click" },
  { x: 0.18, y: 0.22, ms: 650, wait: 600, action: "click" },
  { x: 0.18, y: 0.22, wait: 900, action: "click" },
  { x: 0.84, y: 0.62, ms: 650, wait: 500, action: "click" },
  { x: 0.6, y: 0.88, ms: 650, wait: 300, action: "click" },
  { x: 0.5, y: 0.14, ms: 650, wait: 300, action: "click" },
  { x: 0.5, y: 0.47, ms: 600, wait: 1300, action: "click" },
  { x: 0.84, y: 0.62, ms: 650, wait: 400, action: "click" },
  { x: 0.4, y: 0.88, ms: 650, wait: 300, action: "click" },
];

export function PreviewDynamicIsland({ compact = false }: { compact?: boolean } = {}) {
  const [state, setState] = React.useState<IslandState>("timer");

  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <div className={cn("relative h-[300px] w-[420px]", compact && "scale-95")}>
        <div className="absolute inset-x-0 top-6 flex justify-center">
          <DynamicIsland state={state} onStateChange={setState} />
        </div>

        <div
          role="radiogroup"
          aria-label="Island activity"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/[0.05] p-1 dark:bg-white/[0.08]"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={state === o.value}
              onClick={() => setState(o.value)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17181a] dark:focus-visible:outline-white",
                state === o.value
                  ? "bg-white text-[#17181a] shadow-[0_1px_3px_rgba(23,24,26,0.12)] dark:bg-white/90"
                  : "text-[#73726d] hover:text-[#17181a] dark:text-white/55 dark:hover:text-white",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <DemoCursor script={SCRIPT} loopDelay={1800} />
      </div>
    </div>
  );
}
