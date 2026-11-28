"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WheelSelector } from "@/components/wheel-selector";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "WheelSelector",
    importPath: "@/components/wheel-selector",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "contentMode", label: "Panel", options: ["detailed", "minimal", "hidden"], defaultValue: "detailed" },
      { kind: "select", prop: "animationSpeed", label: "Snap", options: ["slow", "medium", "fast"], defaultValue: "medium" },
      { kind: "range", prop: "ringRadius", label: "Ring radius", min: 80, max: 180, step: 4, unit: "px", defaultValue: 112 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <WheelSelector
        key={String(v.autoplay)}
        contentMode={v.contentMode as "detailed"}
        animationSpeed={v.animationSpeed as "medium"}
        ringRadius={v.ringRadius as number}
        autoplay={v.autoplay as boolean}
        className="max-w-[760px]"
      />
    ),
  };
