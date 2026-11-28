"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WakeSlider } from "@/components/wake-slider";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "WakeSlider",
    importPath: "@/components/wake-slider",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#ff9f0a", "#0a84ff", "#30d158", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "select", prop: "label", label: "Label", options: ["Brightness", "Volume", "Warmth"], defaultValue: "Brightness" },
      { kind: "range", prop: "defaultValue", label: "Start value", min: 0, max: 100, step: 1, defaultValue: 40 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <WakeSlider autoplay={v.autoplay as boolean} key={`${String(v.defaultValue)}-${String(v.autoplay)}`} accent={v.accent as string} label={v.label as string} defaultValue={v.defaultValue as number} />,
  };
