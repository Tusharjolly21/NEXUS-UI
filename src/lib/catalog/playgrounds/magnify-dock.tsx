"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MagnifyDock } from "@/components/magnify-dock";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MagnifyDock",
    importPath: "@/components/magnify-dock",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "baseSize", label: "Icon size", min: 32, max: 64, step: 1, unit: "px", defaultValue: 46 },
      { kind: "range", prop: "maxSize", label: "Size under the pointer", min: 48, max: 104, step: 1, unit: "px", defaultValue: 76 },
      { kind: "range", prop: "reach", label: "Reach", min: 60, max: 300, step: 10, unit: "px", defaultValue: 150 },
      { kind: "range", prop: "gap", label: "Gap between icons", min: 0, max: 28, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "stiffness", label: "Spring stiffness", min: 100, max: 800, step: 10, defaultValue: 320 },
      { kind: "toggle", prop: "showLabels", label: "Show labels", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Sweep by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MagnifyDock
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        baseSize={v.baseSize as number}
        maxSize={v.maxSize as number}
        reach={v.reach as number}
        gap={v.gap as number}
        stiffness={v.stiffness as number}
        showLabels={v.showLabels as boolean}
      />
    ),
  };
