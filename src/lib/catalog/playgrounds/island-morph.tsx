"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { IslandMorph } from "@/components/island-morph";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "IslandMorph",
    importPath: "@/components/island-morph",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "stiffness", label: "Spring stiffness", min: 150, max: 700, step: 10, defaultValue: 380 },
      { kind: "range", prop: "damping", label: "Spring damping", min: 12, max: 50, step: 1, defaultValue: 30 },
      { kind: "range", prop: "blur", label: "Content blur", min: 0, max: 20, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "contentDelay", label: "Content delay", min: 0, max: 0.4, step: 0.02, unit: "s", defaultValue: 0.08 },
      { kind: "color", prop: "surface", label: "Pill colour", options: ["#000000", "#1c1c3a", "#0a3d2e", "#4a0f1f", "#2c2c2e"], defaultValue: "#000000" },
      { kind: "color", prop: "timerColor", label: "Timer colour", options: ["#ff9f0a", "#30d158", "#0a84ff", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "autoplay", label: "Cycle states", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <IslandMorph
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        stiffness={v.stiffness as number}
        damping={v.damping as number}
        blur={v.blur as number}
        contentDelay={v.contentDelay as number}
        surface={v.surface as string}
        timerColor={v.timerColor as string}
      />
    ),
  };
