"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlassCompare } from "@/components/glass-compare";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GlassCompare",
    importPath: "@/components/glass-compare",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "defaultValue", label: "Starting position", min: 0.1, max: 0.9, step: 0.05, defaultValue: 0.5 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[520px] justify-center">
        <GlassCompare
          key={`${String(v.autoplay)}-${String(v.defaultValue)}`}
          autoplay={v.autoplay as boolean}
          defaultValue={v.defaultValue as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
