"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FalloffAccordion } from "@/components/falloff-accordion";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FalloffAccordion",
    importPath: "@/components/falloff-accordion",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "expand", label: "Open width", min: 2, max: 12, step: 1, unit: "x", defaultValue: 7 },
      { kind: "range", prop: "spread", label: "Reach", min: 0.3, max: 3, step: 0.1, defaultValue: 1.1 },
      { kind: "range", prop: "gap", label: "Gap", min: 0, max: 16, step: 2, unit: "px", defaultValue: 6 },
      { kind: "range", prop: "radius", label: "Corner radius", min: 0, max: 32, step: 2, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <FalloffAccordion
        key={String(v.autoplay)}
        expand={v.expand as number}
        spread={v.spread as number}
        gap={v.gap as number}
        radius={v.radius as number}
        speed={v.speed as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
