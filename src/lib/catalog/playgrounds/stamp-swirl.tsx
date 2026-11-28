"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StampSwirl } from "@/components/stamp-swirl";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StampSwirl",
    importPath: "@/components/stamp-swirl",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Stamp size", min: 0.7, max: 1.2, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "spacing", label: "Spacing", min: 4, max: 28, step: 1, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "swirl", label: "Swirl strength", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "speed", label: "Flow speed", min: 0.2, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "hoverScale", label: "Hover grow", min: 1.1, max: 1.8, step: 0.05, unit: "x", defaultValue: 1.45 },
      { kind: "toggle", prop: "autoplay", label: "Lift by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <StampSwirl
        key={String(v.autoplay)}
        size={v.size as number}
        spacing={v.spacing as number}
        swirl={v.swirl as number}
        speed={v.speed as number}
        hoverScale={v.hoverScale as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
