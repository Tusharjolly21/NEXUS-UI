"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RunawayButton } from "@/components/runaway-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RunawayButton",
    importPath: "@/components/runaway-button",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "dodgeRadius", label: "Notice distance", min: 70, max: 170, step: 5, unit: "px", defaultValue: 78 },
      { kind: "range", prop: "maxDodges", label: "Dodges before it gives up", min: 1, max: 8, step: 1, defaultValue: 4 },
      { kind: "range", prop: "speed", label: "Escape speed", min: 0.4, max: 3, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "wobble", label: "Wobble", min: 0, max: 2.5, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Dodge by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <RunawayButton
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        dodgeRadius={v.dodgeRadius as number}
        maxDodges={v.maxDodges as number}
        speed={v.speed as number}
        wobble={v.wobble as number}
      />
    ),
  };
