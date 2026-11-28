"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StreakCounter } from "@/components/streak-counter";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StreakCounter",
    importPath: "@/components/streak-counter",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "start", label: "Start at", min: 0, max: 60, step: 1, defaultValue: 11 },
      { kind: "toggle", prop: "autoplay", label: "Log by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StreakCounter key={`${v.start}-${v.autoplay}`} start={v.start as number} autoplay={v.autoplay as boolean} />,
  };
