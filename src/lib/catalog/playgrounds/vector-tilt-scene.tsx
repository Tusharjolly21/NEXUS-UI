"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { VectorTiltScene } from "@/components/vector-tilt-scene";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "VectorTiltScene",
    importPath: "@/components/vector-tilt-scene",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "maxTilt", label: "Max tilt", min: 0, max: 30, step: 1, unit: "°", defaultValue: 14 },
      { kind: "range", prop: "depth", label: "Depth", min: 0, max: 60, step: 1, unit: "px", defaultValue: 26 },
      { kind: "toggle", prop: "glare", label: "Glare", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <VectorTiltScene
        key={String(v.autoplay)}
        maxTilt={v.maxTilt as number}
        depth={v.depth as number}
        glare={v.glare as boolean}
        autoplay={v.autoplay as boolean}
        className="max-w-[360px]"
      />
    ),
  };
