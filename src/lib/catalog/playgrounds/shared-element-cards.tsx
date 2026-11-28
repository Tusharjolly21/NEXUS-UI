"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SharedElementCards } from "@/components/shared-element-cards";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SharedElementCards",
    importPath: "@/components/shared-element-cards",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "stiffness", label: "Spring stiffness", min: 100, max: 600, step: 10, defaultValue: 300 },
      { kind: "range", prop: "damping", label: "Spring damping", min: 10, max: 50, step: 1, defaultValue: 32 },
      { kind: "range", prop: "height", label: "Height", min: 280, max: 460, step: 10, unit: "px", defaultValue: 340 },
      { kind: "range", prop: "radius", label: "Corner radius", min: 0, max: 44, step: 2, unit: "px", defaultValue: 24 },
      { kind: "range", prop: "gap", label: "Gap between cards", min: 0, max: 32, step: 2, unit: "px", defaultValue: 12 },
      { kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SharedElementCards
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        stiffness={v.stiffness as number}
        damping={v.damping as number}
        height={v.height as number}
        radius={v.radius as number}
        gap={v.gap as number}
      />
    ),
  };
