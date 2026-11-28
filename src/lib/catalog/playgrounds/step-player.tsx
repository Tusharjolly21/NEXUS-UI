"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StepPlayer } from "@/components/step-player";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StepPlayer",
    importPath: "@/components/step-player",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "stepDuration", label: "Step length", min: 1.5, max: 6, step: 0.1, unit: "s", defaultValue: 3.2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StepPlayer key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} stepDuration={v.stepDuration as number} />,
  };
