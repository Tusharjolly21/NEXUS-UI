"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DotSphere } from "@/components/dot-sphere";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "DotSphere",
    importPath: "@/components/dot-sphere",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "dots", label: "Dots", min: 80, max: 1200, step: 20, defaultValue: 420 },
      { kind: "range", prop: "radius", label: "Radius", min: 60, max: 170, step: 2, unit: "px", defaultValue: 130 },
      { kind: "color", prop: "accent", label: "Ripple", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "range", prop: "repel", label: "Repel", min: 0, max: 100, step: 1, defaultValue: 55 },
      { kind: "range", prop: "speed", label: "Spin", min: 0, max: 100, step: 1, defaultValue: 30 },
      { kind: "range", prop: "dotSize", label: "Dot size", min: 1, max: 8, step: 0.2, unit: "px", defaultValue: 3.4 },
      { kind: "toggle", prop: "interactive", label: "Interactive", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Ripple by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DotSphere
        key={String(v.autoplay)}
        dots={v.dots as number}
        radius={v.radius as number}
        accent={v.accent as string}
        repel={v.repel as number}
        speed={v.speed as number}
        dotSize={v.dotSize as number}
        interactive={v.interactive as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
