"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StreamingAnswer } from "@/components/streaming-answer";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StreamingAnswer",
    importPath: "@/components/streaming-answer",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "thoughtSeconds", label: "Thought for", min: 1, max: 30, step: 1, unit: "s", defaultValue: 4 },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <StreamingAnswer key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        thoughtSeconds={v.thoughtSeconds as number}
        width={v.width as number}
      />
    ),
  };
