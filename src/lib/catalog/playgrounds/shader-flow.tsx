"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import * as React from "react";
import type { Playground } from "../playground-types";

const ShaderFlow = React.lazy(() => import("@/components/shader-flow").then((m) => ({ default: m.ShaderFlow })));

export const playground: Playground = {
    lightOnly: true,
    componentName: "ShaderFlow",
    importPath: "@/components/shader-flow",
    defaultFill: "dark",
    controls: [
      { kind: "select", prop: "intensity", label: "Intensity", options: ["low", "medium", "high"], defaultValue: "medium" },
      { kind: "range", prop: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "toggle", prop: "cursorReactive", label: "Stir with pointer", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <ShaderFlow
          key={String(v.autoplay)}
          className="min-h-[400px] w-full max-w-[960px]"
          intensity={v.intensity as "medium"}
          speed={v.speed as number}
          cursorReactive={v.cursorReactive as boolean}
          autoplay={v.autoplay as boolean}
        />
      </React.Suspense>
    ),
  };
