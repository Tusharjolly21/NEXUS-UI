"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MercuryUpload } from "@/components/mercury-upload";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "MercuryUpload",
    importPath: "@/components/mercury-upload",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Upload by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
      { kind: "range", prop: "volume", label: "Volume", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.8 },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[460px] justify-center">
        <MercuryUpload key={String(v.autoplay)} autoplay={v.autoplay as boolean} enableSound={v.enableSound as boolean} volume={v.volume as number} />
      </div>
    ),
  };
