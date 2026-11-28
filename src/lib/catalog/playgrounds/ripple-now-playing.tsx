"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RippleNowPlaying } from "@/components/ripple-now-playing";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RippleNowPlaying",
    importPath: "@/components/ripple-now-playing",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "strength", label: "Ripple strength", min: 0, max: 2.5, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "reach", label: "Ripple reach", min: 0.4, max: 1.6, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "spread", label: "Ripple speed", min: 0.4, max: 2.5, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "tempo", label: "Beat rate", min: 0.4, max: 2.5, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "swell", label: "Cover swell", min: 0, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <RippleNowPlaying
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        strength={v.strength as number}
        reach={v.reach as number}
        spread={v.spread as number}
        tempo={v.tempo as number}
        swell={v.swell as number}
      />
    ),
  };
