"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SqueezeProgress } from "@/components/squeeze-progress";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SqueezeProgress",
    importPath: "@/components/squeeze-progress",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Running", options: ["#0071e3", "#1d1d1f", "#5e5ce6", "#0b8f6a", "#ff375f"], defaultValue: "#0071e3" },
      { kind: "color", prop: "paused", label: "Paused", options: ["#c2410c", "#ff375f", "#ff9f0a", "#8e8e93", "#bf5af2"], defaultValue: "#c2410c" },
      { kind: "toggle", prop: "autoplay", label: "Pause by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SqueezeProgress key={String(v.autoplay)} accent={v.accent as string} paused={v.paused as string} autoplay={v.autoplay as boolean} />,
  };
