"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlassBubbles } from "@/components/glass-bubbles";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GlassBubbles",
    importPath: "@/components/glass-bubbles",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Bubble size", min: 0.6, max: 1.3, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "threadLength", label: "Thread length", min: 0.5, max: 1.3, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "gravity", label: "Gravity", min: 0.2, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "drag", label: "Air drag", min: 0.25, max: 4, step: 0.25, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "push", label: "Pointer push", min: 0.2, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Nudge by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GlassBubbles
        key={String(v.autoplay)}
        size={v.size as number}
        threadLength={v.threadLength as number}
        gravity={v.gravity as number}
        drag={v.drag as number}
        push={v.push as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
