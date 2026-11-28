"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { HeatField } from "@/components/heat-field";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "HeatField",
    importPath: "@/components/heat-field",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Spread", min: 24, max: 80, step: 2, unit: "px", defaultValue: 46 },
      { kind: "toggle", prop: "autoplay", label: "Wander by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <HeatField key={String(v.autoplay)} radius={v.radius as number} autoplay={v.autoplay as boolean} />,
  };
