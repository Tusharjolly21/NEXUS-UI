"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { Sparkles } from "@/components/sparkles";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    fillStage: true,
    componentName: "Sparkles",
    importPath: "@/components/sparkles",
    snippetBaseProps: ["background"],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "count", label: "Count", min: 8, max: 240, step: 4, defaultValue: 60 },
      { kind: "range", prop: "maxSize", label: "Max size", min: 1, max: 6, step: 0.1, unit: "px", defaultValue: 2.8 },
      { kind: "range", prop: "speed", label: "Speed", min: 0.2, max: 3, step: 0.05, unit: "×", defaultValue: 1 },
      { kind: "range", prop: "opacity", label: "Opacity", min: 0.1, max: 1, step: 0.05, defaultValue: 0.9 },
      { kind: "color", prop: "color", label: "Color", options: ["#e5f4ff", "#64d2ff", "#ffd60a", "#ff9fd0", "#0a84ff"], defaultValue: "#e5f4ff" },
      { kind: "select", prop: "direction", label: "Direction", options: ["random", "up", "down"], defaultValue: "random" },
      { kind: "toggle", prop: "enableGlow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "interactive", label: "Trail and bursts", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="relative h-full w-full">
        <Sparkles key={String(v.autoplay)} autoplay={v.autoplay as boolean}
          background
          count={v.count as number}
          maxSize={v.maxSize as number}
          speed={v.speed as number}
          opacity={v.opacity as number}
          color={v.color as string}
          direction={v.direction as "random"}
          enableGlow={v.enableGlow as boolean}
          interactive={v.interactive as boolean}
        />
      </div>
    ),
  };
