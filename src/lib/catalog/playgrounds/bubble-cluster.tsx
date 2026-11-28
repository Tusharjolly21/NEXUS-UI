"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BubbleCluster } from "@/components/bubble-cluster";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "BubbleCluster",
    importPath: "@/components/bubble-cluster",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "gap", label: "Gap", min: 0, max: 24, step: 1, unit: "px", defaultValue: 5 },
      { kind: "range", prop: "sizeContrast", label: "Size contrast", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "bounce", label: "Bounce", min: 0.5, max: 2.5, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "liquid", label: "Liquid backdrop", min: 0, max: 4, step: 0.25, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Cycle groups", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <BubbleCluster
        key={String(v.autoplay)}
        gap={v.gap as number}
        sizeContrast={v.sizeContrast as number}
        bounce={v.bounce as number}
        liquid={v.liquid as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
