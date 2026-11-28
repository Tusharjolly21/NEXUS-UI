"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CursorBuddy } from "@/components/cursor-buddy";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CursorBuddy",
    importPath: "@/components/cursor-buddy",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "shape", label: "Shape", options: ["squircle", "pill", "circle"], defaultValue: "squircle" },
      { kind: "select", prop: "fill", label: "Fill", options: ["light", "dark"], defaultValue: "light" },
      { kind: "select", prop: "eyes", label: "Eyes", options: ["dots", "slits", "squares"], defaultValue: "dots" },
      { kind: "range", prop: "follow", label: "Follow", min: 0, max: 100, step: 1, defaultValue: 60 },
      { kind: "range", prop: "size", label: "Size", min: 60, max: 200, step: 2, unit: "px", defaultValue: 120 },
      { kind: "range", prop: "sleepAfter", label: "Sleep after", min: 0, max: 20000, step: 500, unit: "ms", defaultValue: 9000 },
      { kind: "toggle", prop: "poke", label: "Poke to hop", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Autoplay", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CursorBuddy
        key={String(v.autoplay)}
        shape={v.shape as "squircle"}
        fill={v.fill as "light"}
        eyes={v.eyes as "dots"}
        follow={v.follow as number}
        size={v.size as number}
        sleepAfter={v.sleepAfter as number}
        poke={v.poke as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
