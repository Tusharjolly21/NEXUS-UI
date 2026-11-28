"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TrafficBars } from "@/components/traffic-bars";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TrafficBars",
    importPath: "@/components/traffic-bars",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "palette", label: "Palette", options: ["Ocean", "Sunset", "Forest"], defaultValue: "Ocean" },
      { kind: "range", prop: "stagger", label: "Stagger", min: 0, max: 40, step: 2, unit: "ms", defaultValue: 12 },
      { kind: "range", prop: "radius", label: "Radius", min: 0, max: 6, step: 0.5, defaultValue: 2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TrafficBars key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        colors={
          ({
            Ocean: ["#0071e3", "#64d2ff", "#bf5af2"],
            Sunset: ["#ff375f", "#ff9f0a", "#ffd60a"],
            Forest: ["#248a3d", "#30d158", "#a2e635"],
          } as Record<string, string[]>)[v.palette as string]
        }
        stagger={v.stagger as number}
        radius={v.radius as number}
      />
    ),
  };
