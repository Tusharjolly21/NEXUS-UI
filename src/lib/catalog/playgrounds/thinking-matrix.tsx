"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ThinkingMatrix } from "@/components/thinking-matrix";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ThinkingMatrix",
    importPath: "@/components/thinking-matrix",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "pattern", label: "Pattern", options: ["spiral", "ripple", "signals", "orbit"], defaultValue: "spiral" },
      { kind: "select", prop: "tint", label: "Tint", options: ["amber", "ice", "mint"], defaultValue: "amber" },
      { kind: "range", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <ThinkingMatrix pattern={v.pattern as "spiral" | "ripple" | "signals" | "orbit"} tint={v.tint as "amber" | "ice" | "mint"} speed={v.speed as number} />
      </div>
    ),
  };
