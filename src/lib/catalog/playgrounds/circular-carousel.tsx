"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CircularCarousel } from "@/components/circular-carousel";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CircularCarousel",
    importPath: "@/components/circular-carousel",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "autoPlayInterval", label: "Step every", min: 1000, max: 5000, step: 100, unit: "ms", defaultValue: 2600 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CircularCarousel key={String(v.autoplay)} autoPlayInterval={v.autoPlayInterval as number} autoplay={v.autoplay as boolean} />
    ),
  };
