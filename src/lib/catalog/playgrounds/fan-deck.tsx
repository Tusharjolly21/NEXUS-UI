"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FanDeck } from "@/components/fan-deck";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "FanDeck",
    importPath: "@/components/fan-deck",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "count", label: "Chips", min: 4, max: 12, step: 1, defaultValue: 12 },
      { kind: "range", prop: "spread", label: "Fan spread", min: 60, max: 180, step: 5, unit: "deg", defaultValue: 180 },
      { kind: "range", prop: "chipSize", label: "Chip size", min: 0.7, max: 1.15, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "lift", label: "Hover lift", min: 0, max: 32, step: 1, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "stagger", label: "Open one by one", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Fan by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <FanDeck
        key={String(v.autoplay)}
        count={v.count as number}
        spread={v.spread as number}
        chipSize={v.chipSize as number}
        lift={v.lift as number}
        stagger={v.stagger as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
