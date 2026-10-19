"use client";

import * as React from "react";
import { HoldToRecord } from "@/components/hold-to-record";
import { DemoCursor } from "@/registry/signature/demo-cursor";

const SCRIPT = [
  { x: 0.5, y: 0.5, ms: 650, action: "down" as const, wait: 1100 },
  { x: 0.46, y: 0.51, ms: 900, wait: 500 },
  { action: "up" as const, wait: 3400 },
];

export function PreviewHoldToRecord({ compact = false }: { compact?: boolean } = {}) {
  const [round, setRound] = React.useState(0);
  const demoDriven = React.useRef(false);
  const reset = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(reset.current), []);

  return (
    <div
      className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6"
      onPointerDownCapture={(e) => {
        demoDriven.current = e.pointerId === 71;
        if (!demoDriven.current) window.clearTimeout(reset.current);
      }}
    >
      {!compact ? (
        <p className="absolute left-0 right-0 top-[calc(50%-62px)] text-center text-[13px] text-[#73726d] dark:text-neutral-400">
          Press and hold, slide left to cancel
        </p>
      ) : null}
      <HoldToRecord
        key={round}
        onRecorded={() => {
          // the demo puts the button back so the loop can run again
          if (demoDriven.current) reset.current = window.setTimeout(() => setRound((r) => r + 1), 3000);
        }}
      />
      <DemoCursor script={SCRIPT} loopDelay={900} />
    </div>
  );
}
