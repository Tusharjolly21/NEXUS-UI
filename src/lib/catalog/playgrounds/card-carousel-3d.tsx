"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CardCarousel3D } from "@/components/card-carousel-3d";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CardCarousel3D",
    importPath: "@/components/card-carousel-3d",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "itemWidth", label: "Card width", min: 140, max: 220, step: 4, unit: "px", defaultValue: 168 },
      { kind: "range", prop: "perspective", label: "Perspective", min: 600, max: 1800, step: 50, unit: "px", defaultValue: 1100 },
      { kind: "toggle", prop: "autoRotate", label: "Drift", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CardCarousel3D
        key={String(v.autoplay)}
        itemWidth={v.itemWidth as number}
        perspective={v.perspective as number}
        autoRotate={v.autoRotate as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
