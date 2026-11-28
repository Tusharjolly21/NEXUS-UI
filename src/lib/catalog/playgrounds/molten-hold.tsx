"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MoltenHold } from "@/components/molten-hold";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "MoltenHold",
    importPath: "@/components/molten-hold",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "duration", label: "Hold time", min: 0.8, max: 4, step: 0.1, unit: "s", defaultValue: 1.8 },
      { kind: "toggle", prop: "autoplay", label: "Hold by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
      { kind: "range", prop: "volume", label: "Volume", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.8 },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[560px] justify-center">
        <MoltenHold key={`${String(v.autoplay)}-${String(v.duration)}`} duration={v.duration as number} autoplay={v.autoplay as boolean} enableSound={v.enableSound as boolean} volume={v.volume as number} />
      </div>
    ),
  };
