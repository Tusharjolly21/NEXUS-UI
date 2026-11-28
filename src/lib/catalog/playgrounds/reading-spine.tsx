"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ReadingSpine } from "@/components/reading-spine";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ReadingSpine",
    importPath: "@/components/reading-spine",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[640px]">
        <ReadingSpine key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
