"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DominoProgress } from "@/components/domino-progress";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "DominoProgress",
    importPath: "@/components/domino-progress",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[560px]">
        <DominoProgress key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
