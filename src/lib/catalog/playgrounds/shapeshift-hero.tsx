"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ShapeshiftHero } from "@/components/shapeshift-hero";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ShapeshiftHero",
    importPath: "@/components/shapeshift-hero",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "dwell", label: "Seconds per scene", min: 0, max: 12, step: 1, unit: "s", defaultValue: 6 },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[900px] justify-center">
        <ShapeshiftHero key={String(v.dwell)} dwell={v.dwell as number} />
      </div>
    ),
  };
