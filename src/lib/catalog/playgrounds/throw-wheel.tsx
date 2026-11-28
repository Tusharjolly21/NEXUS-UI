"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ThrowWheel } from "@/components/throw-wheel";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ThrowWheel",
    importPath: "@/components/throw-wheel",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "count", label: "Cards on the wheel", min: 5, max: 10, step: 1, defaultValue: 10 },
      { kind: "range", prop: "cardSize", label: "Card size", min: 0.6, max: 1.2, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "glide", label: "Glide", min: 0.3, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "tilt", label: "Edge-on turn", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "blur", label: "Speed blur", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Throw by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ThrowWheel
        key={`${v.autoplay}-${v.count}`}
        count={v.count as number}
        cardSize={v.cardSize as number}
        glide={v.glide as number}
        tilt={v.tilt as number}
        blur={v.blur as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
