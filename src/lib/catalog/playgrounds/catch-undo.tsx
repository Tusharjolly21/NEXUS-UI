"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CatchUndo } from "@/components/catch-undo";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "CatchUndo",
    importPath: "@/components/catch-undo",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "height", label: "Height", min: 460, max: 640, step: 10, unit: "px", defaultValue: 560 },
      { kind: "toggle", prop: "slowHand", label: "Slow hand", defaultValue: false },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <CatchUndo key={String(v.autoplay)} autoplay={v.autoplay as boolean} height={v.height as number} slowHand={v.slowHand as boolean} />
      </div>
    ),
  };
