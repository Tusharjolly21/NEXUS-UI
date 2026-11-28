"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CurvedReel } from "@/components/curved-reel";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "CurvedReel",
    importPath: "@/components/curved-reel",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "cardSize", label: "Poster size", min: 0.7, max: 1.3, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "gap", label: "Gap", min: 0, max: 48, step: 2, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "curve", label: "Curve", min: 0, max: 1.6, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "speed", label: "Drift speed", min: 10, max: 120, step: 2, unit: "px/s", defaultValue: 38 },
      { kind: "range", prop: "glide", label: "Glide after a fling", min: 0.3, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CurvedReel
        cardSize={v.cardSize as number}
        gap={v.gap as number}
        curve={v.curve as number}
        speed={v.speed as number}
        glide={v.glide as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
