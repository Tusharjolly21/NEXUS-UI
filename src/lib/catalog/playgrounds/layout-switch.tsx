"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LayoutSwitch } from "@/components/layout-switch";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LayoutSwitch",
    importPath: "@/components/layout-switch",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "count", label: "Photos", min: 3, max: 6, step: 1, defaultValue: 6 },
      { kind: "range", prop: "gap", label: "Gap", min: 0, max: 24, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "radius", label: "Corner radius", min: 0, max: 32, step: 1, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "stiffness", label: "Spring strength", min: 100, max: 500, step: 10, defaultValue: 220 },
      { kind: "range", prop: "damping", label: "Spring damping", min: 12, max: 40, step: 1, defaultValue: 26 },
      { kind: "toggle", prop: "autoplay", label: "Cycle layouts", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <LayoutSwitch
        key={String(v.autoplay)}
        count={v.count as number}
        gap={v.gap as number}
        radius={v.radius as number}
        stiffness={v.stiffness as number}
        damping={v.damping as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
