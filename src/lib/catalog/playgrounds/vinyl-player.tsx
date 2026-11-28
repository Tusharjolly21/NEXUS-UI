"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { VinylPlayer } from "@/components/vinyl-player";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "VinylPlayer",
    importPath: "@/components/vinyl-player",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "speed", label: "Record speed", min: 0.5, max: 2.5, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "coast", label: "Fling coast", min: 0.25, max: 4, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "armStiffness", label: "Arm snap", min: 20, max: 300, step: 5, defaultValue: 80 },
      { kind: "range", prop: "gloss", label: "Groove shine", min: 0, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <VinylPlayer
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        speed={v.speed as number}
        coast={v.coast as number}
        armStiffness={v.armStiffness as number}
        gloss={v.gloss as number}
      />
    ),
  };
