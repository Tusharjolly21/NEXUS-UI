"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BorderBeam } from "@/components/border-beam";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "BorderBeam",
    importPath: "@/components/border-beam",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "palette", label: "Palette", options: ["spectrum", "neon", "sunset", "aurora", "ocean"], defaultValue: "spectrum" },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "range", prop: "duration", label: "Lap time", min: 1, max: 8, step: 0.2, unit: "s", defaultValue: 2.6 },
      { kind: "range", prop: "strength", label: "Strength", min: 0.2, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "twin", label: "Twin beams", defaultValue: false },
      { kind: "toggle", prop: "reverse", label: "Counterclockwise", defaultValue: false },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <BorderBeam radius={20} palette={v.palette as "spectrum" | "neon" | "sunset" | "aurora" | "ocean"} size={v.size as "sm" | "md" | "lg"} duration={v.duration as number} strength={v.strength as number} twin={v.twin as boolean} direction={v.reverse ? "counterclockwise" : "clockwise"}>
          <div className="rounded-[20px] bg-[#070707] px-6 py-5 text-[15px] text-white/80">Ask anything, and the light follows.</div>
        </BorderBeam>
      </div>
    ),
  };
