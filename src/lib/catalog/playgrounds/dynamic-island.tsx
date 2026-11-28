"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DynamicIsland } from "@/components/dynamic-island";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "DynamicIsland",
    importPath: "@/components/dynamic-island",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultState", label: "Activity", options: ["idle", "timer", "music", "call"], defaultValue: "timer" },
      { kind: "range", prop: "timerSeconds", label: "Timer", min: 10, max: 1800, step: 10, unit: "s", defaultValue: 300 },
      { kind: "color", prop: "accent", label: "Accent", options: ["#ff9f0a", "#30d158", "#0a84ff", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "range", prop: "cycle", label: "Auto cycle", min: 0, max: 8000, step: 500, unit: "ms", defaultValue: 0 },
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DynamicIsland
        key={`${v.defaultState as string}-${String(v.autoplay)}`}
        defaultState={v.defaultState as "timer"}
        timerSeconds={v.timerSeconds as number}
        accent={v.accent as string}
        cycle={v.cycle as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
