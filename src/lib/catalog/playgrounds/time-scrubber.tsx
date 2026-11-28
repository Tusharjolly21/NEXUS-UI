"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TimeScrubber } from "@/components/time-scrubber";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TimeScrubber",
    importPath: "@/components/time-scrubber",
    snippetBaseProps: ['label="Pickup"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "interval", label: "Snap", min: 5, max: 30, step: 5, unit: "min", defaultValue: 15 },
      { kind: "select", prop: "format", label: "Format", options: ["12h", "24h"], defaultValue: "12h" },
      { kind: "range", prop: "density", label: "Spread", min: 0.8, max: 3, step: 0.1, unit: "px", defaultValue: 1.6 },
      { kind: "color", prop: "accent", label: "Needle", options: ["#0071e3", "#ff3b30", "#ff9f0a", "#30d158", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TimeScrubber key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        label="Pickup"
        interval={v.interval as number}
        format={v.format as "12h"}
        density={v.density as number}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
      />
    ),
  };
