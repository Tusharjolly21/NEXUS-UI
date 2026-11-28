"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StatusMorph } from "@/components/status-morph";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StatusMorph",
    importPath: "@/components/status-morph",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "theme", label: "Theme", options: ["light", "dark"], defaultValue: "light" },
      { kind: "range", prop: "size", label: "Size", min: 180, max: 420, step: 10, unit: "px", defaultValue: 260 },
      { kind: "range", prop: "speed", label: "Animation speed", min: 0.4, max: 2.5, step: 0.1, unit: "x", defaultValue: 1 },
    ],
    render: (v) => (
      <StatusMorph
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        theme={v.theme as "light"}
        size={v.size as number}
        speed={v.speed as number}
      />
    ),
  };
