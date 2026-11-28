"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TapeShelf } from "@/components/tape-shelf";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TapeShelf",
    importPath: "@/components/tape-shelf",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Case size", min: 0.8, max: 1.3, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "spacing", label: "Spacing", min: 0, max: 20, step: 1, unit: "px", defaultValue: 6 },
      { kind: "range", prop: "tilt", label: "Shelf angle", min: 0, max: 1.6, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "lift", label: "Hover lift", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "snap", label: "Spring speed", min: 0.5, max: 2.5, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TapeShelf
        key={String(v.autoplay)}
        size={v.size as number}
        spacing={v.spacing as number}
        tilt={v.tilt as number}
        lift={v.lift as number}
        snap={v.snap as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
