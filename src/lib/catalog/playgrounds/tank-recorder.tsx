"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TankRecorder } from "@/components/tank-recorder";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TankRecorder",
    importPath: "@/components/tank-recorder",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <TankRecorder key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  };
