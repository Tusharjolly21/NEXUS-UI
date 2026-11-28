"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BoxSpill } from "@/components/box-spill";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "BoxSpill",
    importPath: "@/components/box-spill",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "count", label: "Pieces", min: 10, max: 60, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BoxSpill key={String(v.autoplay)} count={v.count as number} autoplay={v.autoplay as boolean} />,
  };
