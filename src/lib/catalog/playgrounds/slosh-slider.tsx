"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SloshSlider } from "@/components/slosh-slider";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SloshSlider",
    importPath: "@/components/slosh-slider",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Liquid", options: ["#0071e3", "#30d158", "#ff9f0a", "#ff375f", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Volume", "Brightness", "Bass"], defaultValue: "Volume" },
      { kind: "toggle", prop: "autoplay", label: "Slosh by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SloshSlider key={String(v.autoplay)} accent={v.accent as string} label={v.label as string} autoplay={v.autoplay as boolean} />,
  };
