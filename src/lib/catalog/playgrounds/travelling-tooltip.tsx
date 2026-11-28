"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TravellingTooltip } from "@/components/travelling-tooltip";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TravellingTooltip",
    importPath: "@/components/travelling-tooltip",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "openDelay", label: "First hover delay", min: 0, max: 1000, step: 50, unit: "ms", defaultValue: 450 },
      { kind: "range", prop: "warmMs", label: "Stays warm", min: 0, max: 2000, step: 100, unit: "ms", defaultValue: 600 },
      { kind: "select", prop: "label", label: "Toolbar name", options: ["Formatting", "Text tools", "Editor"], defaultValue: "Formatting" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TravellingTooltip key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        openDelay={v.openDelay as number}
        warmMs={v.warmMs as number}
        label={v.label as string}
      />
    ),
  };
