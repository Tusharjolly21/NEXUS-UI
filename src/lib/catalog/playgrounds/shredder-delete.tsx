"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ShredderDelete } from "@/components/shredder-delete";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ShredderDelete",
    importPath: "@/components/shredder-delete",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "volume", label: "Volume", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.7 },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <ShredderDelete key={String(v.autoplay)} autoplay={v.autoplay as boolean} volume={v.volume as number} />
      </div>
    ),
  };
