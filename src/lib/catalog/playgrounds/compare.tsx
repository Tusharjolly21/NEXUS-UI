"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { Compare } from "@/components/compare";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "Compare",
    importPath: "@/components/compare",
    snippetBaseProps: ['beforeLabel="Original"', 'afterLabel="Graded"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "initialPosition", label: "Start at", min: 5, max: 95, step: 1, unit: "%", defaultValue: 50 },
      { kind: "select", prop: "mode", label: "Mode", options: ["drag", "hover"], defaultValue: "drag" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <Compare
        key={`${v.initialPosition}-${v.autoplay}`}
        beforeLabel="Original"
        afterLabel="Graded"
        initialPosition={v.initialPosition as number}
        mode={v.mode as "drag"}
        autoplay={v.autoplay as boolean}
        className="max-w-[400px]"
      />
    ),
  };
