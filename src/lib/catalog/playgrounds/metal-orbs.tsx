"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MetalOrbs } from "@/components/metal-orbs";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MetalOrbs",
    importPath: "@/components/metal-orbs",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "height", label: "Height", min: 200, max: 340, step: 10, unit: "px", defaultValue: 280 },
      { kind: "toggle", prop: "autoplay", label: "Cycle modes", defaultValue: false, startOn: true },
    ],
    render: (v) => <MetalOrbs key={String(v.autoplay)} height={v.height as number} autoplay={v.autoplay as boolean} />,
  };
