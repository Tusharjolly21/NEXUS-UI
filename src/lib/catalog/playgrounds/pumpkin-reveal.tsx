"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PumpkinReveal } from "@/components/pumpkin-reveal";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PumpkinReveal",
    importPath: "@/components/pumpkin-reveal",
    defaultFill: "dark",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <PumpkinReveal key={String(v.autoplay)} autoplay={v.autoplay as boolean} music="/audio/pumpkin-burst.mp3" />
      </div>
    ),
  };
