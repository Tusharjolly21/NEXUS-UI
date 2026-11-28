"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TypewriterEffect } from "@/components/typewriter-effect";
import type { Playground } from "../playground-types";

const TYPEWRITER_LINES = ["Ship faster.", "Build better.", "Delight users."];

export const playground: Playground = {
    componentName: "TypewriterEffect",
    importPath: "@/components/typewriter-effect",
    snippetBaseProps: ['text={["Ship faster.", "Build better.", "Delight users."]}'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "typingSpeed", label: "Typing", min: 20, max: 200, step: 5, unit: "ms", defaultValue: 65 },
      { kind: "range", prop: "deletingSpeed", label: "Deleting", min: 0, max: 150, step: 2, unit: "ms", defaultValue: 42 },
      { kind: "range", prop: "pauseDuration", label: "Pause", min: 0, max: 4000, step: 100, unit: "ms", defaultValue: 1200 },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: true },
      { kind: "toggle", prop: "showCursor", label: "Caret", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <h2 className="m-0 text-center text-4xl font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-5xl dark:text-[#f5f5f7]">
        <TypewriterEffect autoplay={v.autoplay as boolean}
          key={`${String(v.loop)}-${String(v.deletingSpeed)}-${String(v.autoplay)}`}
          text={TYPEWRITER_LINES}
          typingSpeed={v.typingSpeed as number}
          deletingSpeed={v.deletingSpeed as number}
          pauseDuration={v.pauseDuration as number}
          loop={v.loop as boolean}
          showCursor={v.showCursor as boolean}
          className="text-[#0071e3] dark:text-[#0a84ff]"
        />
      </h2>
    ),
  };
