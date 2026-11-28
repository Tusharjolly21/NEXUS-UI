"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PulseMonitor } from "@/components/pulse-monitor";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PulseMonitor",
    importPath: "@/components/pulse-monitor",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "bpm", label: "Resting BPM", min: 48, max: 100, step: 1, unit: "bpm", defaultValue: 68 },
      { kind: "color", prop: "color", label: "Trace", options: ["#ff375f", "#0a84ff", "#30d158", "#bf5af2", "#64d2ff"], defaultValue: "#ff375f" },
      { kind: "color", prop: "workoutColor", label: "Workout", options: ["#ff9f0a", "#ffd60a", "#ff375f", "#30d158"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PulseMonitor key={String(v.autoplay)} autoplay={v.autoplay as boolean} bpm={v.bpm as number} color={v.color as string} workoutColor={v.workoutColor as string} />,
  };
