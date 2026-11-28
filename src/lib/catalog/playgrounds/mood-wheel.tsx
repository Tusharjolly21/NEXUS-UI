"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MoodWheel } from "@/components/mood-wheel";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MoodWheel",
    importPath: "@/components/mood-wheel",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Wheel radius", min: 140, max: 300, step: 10, unit: "px", defaultValue: 220 },
      { kind: "range", prop: "spacing", label: "Word spacing", min: 0.24, max: 0.5, step: 0.02, defaultValue: 0.32 },
      { kind: "range", prop: "orbSize", label: "Orb size", min: 90, max: 190, step: 10, unit: "px", defaultValue: 150 },
      { kind: "range", prop: "glide", label: "Glide", min: 0.4, max: 3, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Spin by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MoodWheel
        key={String(v.autoplay)}
        radius={v.radius as number}
        spacing={v.spacing as number}
        orbSize={v.orbSize as number}
        glide={v.glide as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
