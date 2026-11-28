"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SandDriftGallery } from "@/components/sand-drift-gallery";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SandDriftGallery",
    importPath: "@/components/sand-drift-gallery",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "scatter", label: "Sand scatter", min: 40, max: 260, step: 10, defaultValue: 150 },
      { kind: "range", prop: "drift", label: "Drift speed", min: 0, max: 60, step: 2, defaultValue: 22 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[900px] justify-center">
        <SandDriftGallery
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          scatter={v.scatter as number}
          drift={v.drift as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
