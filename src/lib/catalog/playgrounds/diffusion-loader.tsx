"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DiffusionLoader } from "@/components/diffusion-loader";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "DiffusionLoader",
    importPath: "@/components/diffusion-loader",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "steps", label: "Steps", min: 10, max: 50, step: 1, defaultValue: 30 },
      { kind: "range", prop: "duration", label: "Duration", min: 2, max: 10, step: 0.2, defaultValue: 5.2 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[440px] justify-center">
        <DiffusionLoader
          key={`${String(v.autoplay)}-${String(v.steps)}-${String(v.duration)}`}
          autoplay={v.autoplay as boolean}
          steps={v.steps as number}
          duration={v.duration as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
