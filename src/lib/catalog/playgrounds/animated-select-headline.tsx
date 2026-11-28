"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AnimatedSelectHeadline } from "@/components/animated-select-headline";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AnimatedSelectHeadline",
    importPath: "@/components/animated-select-headline",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "interval", label: "Hold", min: 800, max: 5000, step: 100, unit: "ms", defaultValue: 2500 },
      { kind: "toggle", prop: "showCursor", label: "Cursors", defaultValue: true },
      { kind: "toggle", prop: "showSize", label: "Size badge", defaultValue: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <AnimatedSelectHeadline
          words={["warp speed", "record time", "pure flow", "light speed"]}
          interval={v.interval as number}
          showCursor={v.showCursor as boolean}
          showSize={v.showSize as boolean}
          headingClassName="text-[36px] sm:text-[44px]"
        />
      </div>
    ),
  };
