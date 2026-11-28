"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { Meteors } from "@/components/meteors";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    fillStage: true,
    componentName: "Meteors",
    importPath: "@/components/meteors",
    snippetBaseProps: ['className="absolute inset-0"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "number", label: "Meteors", min: 4, max: 60, step: 1, defaultValue: 18 },
      { kind: "range", prop: "angle", label: "Angle", min: 180, max: 270, step: 1, unit: "°", defaultValue: 215 },
      { kind: "range", prop: "maxDuration", label: "Max duration", min: 2, max: 12, step: 0.1, unit: "s", defaultValue: 7.2 },
      { kind: "range", prop: "stars", label: "Stars", min: 0, max: 160, step: 10, defaultValue: 0 },
      { kind: "color", prop: "color", label: "Color", options: ["#cfe6ff", "#c4b5fd", "#fda4af", "#ffd60a", "#64d2ff"], defaultValue: "#cfe6ff" },
      { kind: "select", prop: "intensity", label: "Intensity", options: ["low", "medium", "high"], defaultValue: "medium" },
      { kind: "toggle", prop: "glow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "interactive", label: "Gravity and strikes", defaultValue: true },
      { kind: "toggle", prop: "hoverOnly", label: "Only on hover", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <Meteors
        key={String(v.autoplay)}
        className="absolute inset-0"
        number={v.number as number}
        angle={v.angle as number}
        maxDuration={v.maxDuration as number}
        minDuration={Math.min(3.2, (v.maxDuration as number) - 0.5)}
        stars={v.stars as number}
        color={v.color as string}
        intensity={v.intensity as "medium"}
        glow={v.glow as boolean}
        interactive={v.interactive as boolean}
        hoverOnly={v.hoverOnly as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
