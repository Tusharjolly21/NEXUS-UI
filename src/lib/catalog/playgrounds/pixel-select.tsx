"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PixelSelect } from "@/components/pixel-select";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PixelSelect",
    importPath: "@/components/pixel-select",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "pixelSize", label: "Pixel size", min: 10, max: 24, step: 2, unit: "px", defaultValue: 12 },
      { kind: "range", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "stagger", label: "Ripple", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "scatter", label: "Scatter", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "select", prop: "origin", label: "Builds from", options: ["top-left", "top-right", "bottom-left", "bottom-right", "center"], defaultValue: "top-left" },
      { kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PixelSelect
        key={String(v.autoplay)}
        pixelSize={v.pixelSize as number}
        speed={v.speed as number}
        stagger={v.stagger as number}
        scatter={v.scatter as number}
        origin={v.origin as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
