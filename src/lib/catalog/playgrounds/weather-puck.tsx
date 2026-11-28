"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WeatherPuck } from "@/components/weather-puck";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "WeatherPuck",
    importPath: "@/components/weather-puck",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "spacing", label: "Dot spacing", min: 8, max: 24, step: 1, unit: "px", defaultValue: 14 },
      { kind: "range", prop: "dotSize", label: "Dot size", min: 0.6, max: 1.8, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "reach", label: "Light reach", min: 0.5, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "lift", label: "Dot lift", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "showClock", label: "Show clock", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Sweep by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <WeatherPuck
        key={String(v.autoplay)}
        spacing={v.spacing as number}
        dotSize={v.dotSize as number}
        reach={v.reach as number}
        lift={v.lift as number}
        showClock={v.showClock as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
