"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BeamField } from "@/components/beam-sweep-field";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "BeamField",
    importPath: "@/components/beam-sweep-field",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Beam", options: ["#67e8f9", "#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#67e8f9" },
      { kind: "range", prop: "beams", label: "Beams", min: 1, max: 5, step: 1, defaultValue: 3 },
      { kind: "range", prop: "speed", label: "Sweep", min: 4, max: 20, step: 1, unit: "s", defaultValue: 11 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <BeamField
        key={String(v.autoplay)}
        color={v.color as string}
        beams={v.beams as number}
        speed={v.speed as number}
        autoplay={v.autoplay as boolean}
        className="min-h-[400px] max-w-[960px]"
      />
    ),
  };
