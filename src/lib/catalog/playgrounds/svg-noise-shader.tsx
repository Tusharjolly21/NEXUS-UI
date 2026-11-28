"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SvgNoise } from "@/components/svg-noise-shader";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SvgNoise",
    importPath: "@/components/svg-noise-shader",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "grain", label: "Grain", min: 0, max: 1, step: 0.05, defaultValue: 0.35 },
      { kind: "range", prop: "distortion", label: "Melt", min: 0, max: 200, step: 5, unit: "px", defaultValue: 90 },
      { kind: "range", prop: "speed", label: "Flow speed", min: 0.2, max: 3, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SvgNoise
        key={String(v.autoplay)}
        grain={v.grain as number}
        distortion={v.distortion as number}
        speed={v.speed as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
