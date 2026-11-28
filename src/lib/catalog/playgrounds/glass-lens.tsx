"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlassLens } from "@/components/glass-lens";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GlassLens",
    importPath: "@/components/glass-lens",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "zoom", label: "Zoom", min: 1.1, max: 2.2, step: 0.05, unit: "×", defaultValue: 1.45 },
      { kind: "range", prop: "size", label: "Lens", min: 100, max: 200, step: 2, unit: "px", defaultValue: 150 },
      { kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <GlassLens key={String(v.autoplay)} zoom={v.zoom as number} size={v.size as number} autoplay={v.autoplay as boolean} />,
  };
