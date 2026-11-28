"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AspectCrop } from "@/components/aspect-crop";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "AspectCrop",
    importPath: "@/components/aspect-crop",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Frame size", min: 140, max: 260, step: 10, unit: "px", defaultValue: 220 },
      { kind: "range", prop: "radius", label: "Corner radius", min: 0, max: 40, step: 2, unit: "px", defaultValue: 18 },
      { kind: "select", prop: "guides", label: "Grid lines", options: ["flash", "always", "off"], defaultValue: "flash" },
      { kind: "range", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "bounce", label: "Bounce", min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Cycle by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AspectCrop
        key={String(v.autoplay)}
        size={v.size as number}
        radius={v.radius as number}
        guides={v.guides as "flash" | "always" | "off"}
        speed={v.speed as number}
        bounce={v.bounce as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
