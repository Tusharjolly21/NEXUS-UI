"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WordMagnet } from "@/components/word-magnet";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "WordMagnet",
    importPath: "@/components/word-magnet",
    snippetBaseProps: ['text="Push these words around and watch them wobble back"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Radius", min: 40, max: 260, step: 2, unit: "px", defaultValue: 130 },
      { kind: "range", prop: "force", label: "Force", min: 0.05, max: 1, step: 0.01, defaultValue: 0.45 },
      { kind: "range", prop: "damping", label: "Damping", min: 6, max: 60, step: 1, defaultValue: 28 },
      { kind: "range", prop: "returnDelay", label: "Hold", min: 0, max: 1200, step: 20, unit: "ms", defaultValue: 360 },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <WordMagnet
        key={String(v.autoplay)}
        text="Push these words around and watch them wobble back into place"
        radius={v.radius as number}
        force={v.force as number}
        damping={v.damping as number}
        returnDelay={v.returnDelay as number}
        autoplay={v.autoplay as boolean}
        className="max-w-xl text-4xl sm:text-5xl"
      />
    ),
  };
