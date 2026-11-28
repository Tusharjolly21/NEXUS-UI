"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PressureText } from "@/components/pressure-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PressureText",
    importPath: "@/components/pressure-text",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "spread", label: "Spread", min: 0.08, max: 0.4, step: 0.02, defaultValue: 0.18 },
      { kind: "toggle", prop: "autoplay", label: "Breathe by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PressureText key={String(v.autoplay)} accent={v.accent as string} spread={v.spread as number} autoplay={v.autoplay as boolean} />,
  };
