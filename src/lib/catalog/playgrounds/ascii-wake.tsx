"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AsciiWake } from "@/components/ascii-wake";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AsciiWake",
    importPath: "@/components/ascii-wake",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff375f", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "range", prop: "height", label: "Height", min: 200, max: 400, step: 10, unit: "px", defaultValue: 300 },
      { kind: "toggle", prop: "autoplay", label: "Draw by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[560px]">
        <AsciiWake accent={v.accent as string} height={v.height as number} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
