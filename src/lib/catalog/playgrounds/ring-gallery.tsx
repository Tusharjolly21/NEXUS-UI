"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RingGalleryDemo, type RingDemoValues } from "@/lib/catalog/ring-demo";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    blurb: "Move the controls and watch it change, or put your own photos in it. Copy code gives you a snippet with the settings you chose.",
    componentName: "RingGallery",
    importPath: "@/components/ring-gallery",
    defaultFill: "light",
    snippetBaseProps: ["items={photos}"],
    controls: [
      { kind: "range", prop: "count", label: "Cards in the ring", min: 12, max: 120, step: 1, defaultValue: 57 },
      { kind: "range", prop: "radius", label: "Ring size", min: 0.6, max: 1.1, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "cardSize", label: "Card size", min: 0.6, max: 1.6, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "speed", label: "Turn speed", min: 0.4, max: 2.5, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "glide", label: "Glide", min: 0.5, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "tilt", label: "Camera tilt", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "intro", label: "Spin in on load", defaultValue: true },
      { kind: "toggle", prop: "detail", label: "Open entry page", defaultValue: true },
      { kind: "toggle", prop: "enableSound", label: "Ring sounds", defaultValue: true },
    ],
    render: (v) => <RingGalleryDemo v={v as unknown as RingDemoValues} />,
  };
