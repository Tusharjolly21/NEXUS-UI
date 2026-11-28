"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RippleField } from "@/components/ripple-field";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RippleField",
    importPath: "@/components/ripple-field",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "gap", label: "Dot gap", min: 12, max: 28, step: 2, unit: "px", defaultValue: 18 },
      { kind: "range", prop: "height", label: "Height", min: 200, max: 400, step: 10, unit: "px", defaultValue: 300 },
      { kind: "toggle", prop: "autoplay", label: "Drop rings by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[560px]">
        <RippleField gap={v.gap as number} height={v.height as number} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
