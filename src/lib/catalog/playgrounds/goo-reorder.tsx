"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GooReorder } from "@/components/goo-reorder";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GooReorder",
    importPath: "@/components/goo-reorder",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "goo", label: "Gooeyness", min: 1, max: 14, step: 1, defaultValue: 7 },
      { kind: "range", prop: "gap", label: "Row gap", min: 4, max: 24, step: 2, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "rowHeight", label: "Row height", min: 36, max: 64, step: 2, unit: "px", defaultValue: 48 },
      { kind: "range", prop: "lift", label: "Lift on drag", min: 1, max: 1.2, step: 0.02, defaultValue: 1.06 },
      { kind: "range", prop: "bounce", label: "Bounce", min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Shuffle by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GooReorder
        key={String(v.autoplay)}
        goo={v.goo as number}
        gap={v.gap as number}
        rowHeight={v.rowHeight as number}
        lift={v.lift as number}
        bounce={v.bounce as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
