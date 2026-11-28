"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SpectraFrame } from "@/components/spectra-frame";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SpectraFrame",
    importPath: "@/components/spectra-frame",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "columns", label: "Columns", min: 2, max: 4, step: 1, defaultValue: 4 },
      { kind: "range", prop: "borderRadius", label: "Radius", min: 0, max: 28, step: 1, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "grayscaleIntensity", label: "Greyscale", min: 0, max: 100, step: 5, unit: "%", defaultValue: 100 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[540px]">
        <SpectraFrame
          key={String(v.autoplay)}
          columns={v.columns as number}
          borderRadius={v.borderRadius as number}
          grayscaleIntensity={v.grayscaleIntensity as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
