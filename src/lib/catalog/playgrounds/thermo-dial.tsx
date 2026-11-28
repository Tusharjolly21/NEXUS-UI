"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ThermoDial } from "@/components/thermo-dial";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ThermoDial",
    importPath: "@/components/thermo-dial",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "room", label: "Room", min: 10, max: 30, step: 0.5, unit: "°", defaultValue: 19.5 },
      { kind: "range", prop: "defaultValue", label: "Start at", min: 10, max: 30, step: 0.5, unit: "°", defaultValue: 21 },
      { kind: "toggle", prop: "autoplay", label: "Turn by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ThermoDial
        key={`${String(v.autoplay)}-${String(v.defaultValue)}`}
        room={v.room as number}
        defaultValue={v.defaultValue as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
