"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AquariumPrompt } from "@/components/aquarium-prompt";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "AquariumPrompt",
    importPath: "@/components/aquarium-prompt",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[760px] justify-center">
        <AquariumPrompt key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
