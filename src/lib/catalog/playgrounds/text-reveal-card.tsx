"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TextRevealCard } from "@/components/text-reveal-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TextRevealCard",
    importPath: "@/components/text-reveal-card",
    snippetBaseProps: ['title="Launch review"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "intensity", label: "Sparks", min: 0.5, max: 2.2, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "toggle", prop: "disabled", label: "Show revealed", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TextRevealCard
        key={`${v.autoplay}-${v.disabled}`}
        title="Launch review"
        intensity={v.intensity as number}
        disabled={v.disabled as boolean}
        autoplay={v.autoplay as boolean}
        className="max-w-[440px]"
      />
    ),
  };
