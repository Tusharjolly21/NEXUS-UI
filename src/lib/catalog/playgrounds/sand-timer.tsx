"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SandTimer } from "@/components/sand-timer";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SandTimer",
    importPath: "@/components/sand-timer",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "seconds", label: "Seconds", min: 10, max: 120, step: 5, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Turn over by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SandTimer key={`${v.seconds}-${v.autoplay}`} seconds={v.seconds as number} autoplay={v.autoplay as boolean} />,
  };
