"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FerrofluidRecord } from "@/components/ferrofluid-record";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "FerrofluidRecord",
    importPath: "@/components/ferrofluid-record",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "spikes", label: "Spikes", min: 8, max: 48, step: 1, defaultValue: 26 },
      { kind: "range", prop: "pull", label: "Magnet pull", min: 0.3, max: 1.6, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "size", label: "Drop size", min: 0.7, max: 1.3, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "springiness", label: "Springiness", min: 0.3, max: 2, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "voice", label: "Voice bristle", min: 0, max: 2, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Move the magnet", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <FerrofluidRecord
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        spikes={v.spikes as number}
        pull={v.pull as number}
        size={v.size as number}
        springiness={v.springiness as number}
        voice={v.voice as number}
      />
    ),
  };
