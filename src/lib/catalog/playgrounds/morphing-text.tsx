"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MorphingText } from "@/components/morphing-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MorphingText",
    importPath: "@/components/morphing-text",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "align", label: "Align", options: ["left", "center", "right"], defaultValue: "center" },
      { kind: "range", prop: "morphTime", label: "Morph seconds", min: 0.4, max: 2.4, step: 0.1, defaultValue: 1.1 },
      { kind: "range", prop: "holdTime", label: "Hold seconds", min: 0.5, max: 4, step: 0.1, defaultValue: 1.6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MorphingText
        key={String(v.autoplay)}
        align={v.align as "left" | "center" | "right"}
        morphTime={v.morphTime as number}
        holdTime={v.holdTime as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
