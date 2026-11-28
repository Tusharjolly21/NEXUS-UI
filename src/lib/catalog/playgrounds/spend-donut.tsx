"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SpendDonut } from "@/components/spend-donut";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SpendDonut",
    importPath: "@/components/spend-donut",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "thickness", label: "Thickness", min: 10, max: 30, step: 1, unit: "px", defaultValue: 18 },
      { kind: "range", prop: "gap", label: "Gap", min: 0, max: 12, step: 1, unit: "px", defaultValue: 4 },
      { kind: "toggle", prop: "autoplay", label: "Cycle by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SpendDonut key={String(v.autoplay)} thickness={v.thickness as number} gap={v.gap as number} autoplay={v.autoplay as boolean} />,
  };
