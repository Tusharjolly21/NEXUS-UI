"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { HoldToRecord } from "@/components/hold-to-record";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "HoldToRecord",
    importPath: "@/components/hold-to-record",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#ff3b30", "#0071e3", "#30d158", "#bf5af2", "#1d1d1f"], defaultValue: "#ff3b30" },
      { kind: "range", prop: "cancelDistance", label: "Cancel distance", min: 40, max: 160, step: 5, unit: "px", defaultValue: 90 },
      { kind: "range", prop: "maxDuration", label: "Max length", min: 5000, max: 60000, step: 1000, unit: "ms", defaultValue: 60000 },
      { kind: "range", prop: "minDuration", label: "Min hold", min: 0, max: 1500, step: 50, unit: "ms", defaultValue: 400 },
      { kind: "select", prop: "label", label: "Label", options: ["Hold to record", "Hold to talk", "Record a note"], defaultValue: "Hold to record" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <HoldToRecord key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        accent={v.accent as string}
        cancelDistance={v.cancelDistance as number}
        maxDuration={v.maxDuration as number}
        minDuration={v.minDuration as number}
        label={v.label as string}
      />
    ),
  };
