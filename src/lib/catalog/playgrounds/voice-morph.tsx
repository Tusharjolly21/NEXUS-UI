"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { VoiceMorph } from "@/components/voice-morph";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "VoiceMorph",
    importPath: "@/components/voice-morph",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "maxSeconds", label: "Longest message (s)", min: 10, max: 120, step: 10, defaultValue: 60 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[400px] justify-center">
        <VoiceMorph
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          maxSeconds={v.maxSeconds as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
