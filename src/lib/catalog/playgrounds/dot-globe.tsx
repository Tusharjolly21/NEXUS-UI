"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DotGlobe } from "@/components/dot-globe";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "DotGlobe",
    importPath: "@/components/dot-globe",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#ff375f", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "range", prop: "size", label: "Size", min: 260, max: 420, step: 10, unit: "px", defaultValue: 340 },
      { kind: "toggle", prop: "autoplay", label: "Tour cities", defaultValue: false, startOn: true },
    ],
    render: (v) => <DotGlobe key={String(v.autoplay)} accent={v.accent as string} size={v.size as number} autoplay={v.autoplay as boolean} />,
  };
