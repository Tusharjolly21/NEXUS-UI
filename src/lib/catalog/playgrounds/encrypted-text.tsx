"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { EncryptedText } from "@/components/encrypted-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "EncryptedText",
    importPath: "@/components/encrypted-text",
    snippetBaseProps: ['text="ACCESS GRANTED"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "speed", label: "Lock every", min: 10, max: 200, step: 5, unit: "ms", defaultValue: 50 },
      { kind: "range", prop: "shuffleSpeed", label: "Shuffle every", min: 16, max: 120, step: 4, unit: "ms", defaultValue: 36 },
      { kind: "range", prop: "iterations", label: "Warm-up", min: 1, max: 20, step: 1, defaultValue: 8 },
      { kind: "select", prop: "trigger", label: "Trigger", options: ["load", "hover", "click", "viewport"], defaultValue: "load" },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EncryptedText autoplay={v.autoplay as boolean}
        key={`${String(v.trigger)}-${String(v.loop)}-${String(v.autoplay)}`}
        text="ACCESS GRANTED"
        speed={v.speed as number}
        shuffleSpeed={v.shuffleSpeed as number}
        iterations={v.iterations as number}
        trigger={v.trigger as "load"}
        loop={v.loop as boolean}
        className="text-3xl font-semibold tracking-[0.06em] text-[#1d1d1f] sm:text-4xl dark:text-[#f5f5f7]"
      />
    ),
  };
