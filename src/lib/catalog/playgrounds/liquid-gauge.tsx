"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LiquidGauge } from "@/components/liquid-gauge";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "LiquidGauge",
    importPath: "@/components/liquid-gauge",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Liquid", options: ["#0a84ff", "#30d158", "#5e5ce6", "#ff375f", "#64d2ff"], defaultValue: "#0a84ff" },
      { kind: "range", prop: "defaultUsed", label: "Used", min: 0, max: 200, step: 2, unit: " GB", defaultValue: 136 },
      { kind: "toggle", prop: "autoplay", label: "Slosh by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <LiquidGauge
        key={`${String(v.autoplay)}-${String(v.defaultUsed)}`}
        accent={v.accent as string}
        defaultUsed={v.defaultUsed as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
