"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TracingSpotlightPanel } from "@/components/tracing-spotlight-panel";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TracingSpotlightPanel",
    importPath: "@/components/tracing-spotlight-panel",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Light", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "size", label: "Spotlight", min: 120, max: 420, step: 10, unit: "px", defaultValue: 260 },
      { kind: "range", prop: "lap", label: "Lap time", min: 2, max: 12, step: 0.5, unit: "s", defaultValue: 5 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TracingSpotlightPanel
        key={String(v.autoplay)}
        color={v.color === "#0071e3" ? undefined : (v.color as string)}
        size={v.size as number}
        lap={v.lap as number}
        autoplay={v.autoplay as boolean}
        className="max-w-[320px]"
      />
    ),
  };
