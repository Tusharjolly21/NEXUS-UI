"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LenticularPass } from "@/components/lenticular-pass";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LenticularPass",
    importPath: "@/components/lenticular-pass",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "strips", label: "Ridges", min: 12, max: 80, step: 1, defaultValue: 44 },
      { kind: "range", prop: "tilt", label: "Tilt", min: 0, max: 1.6, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "stiffness", label: "Spring", min: 60, max: 320, step: 5, defaultValue: 170 },
      { kind: "range", prop: "shine", label: "Shine", min: 0, max: 2, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Rock by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <LenticularPass
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        strips={v.strips as number}
        tilt={v.tilt as number}
        stiffness={v.stiffness as number}
        shine={v.shine as number}
      />
    ),
  };
