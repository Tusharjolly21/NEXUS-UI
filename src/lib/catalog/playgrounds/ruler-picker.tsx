"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RulerPicker } from "@/components/ruler-picker";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RulerPicker",
    importPath: "@/components/ruler-picker",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Needle", options: ["#ff9f0a", "#0071e3", "#ff375f", "#30b158", "#1d1d1f"], defaultValue: "#ff9f0a" },
      { kind: "range", prop: "max", label: "Max", min: 30, max: 180, step: 15, defaultValue: 90 },
      { kind: "range", prop: "defaultValue", label: "Start at", min: 0, max: 60, step: 5, defaultValue: 25 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <RulerPicker autoplay={v.autoplay as boolean}
        key={`${v.max}-${v.defaultValue}-${String(v.autoplay)}`}
        accent={v.accent as string}
        max={v.max as number}
        defaultValue={v.defaultValue as number}
      />
    ),
  };
