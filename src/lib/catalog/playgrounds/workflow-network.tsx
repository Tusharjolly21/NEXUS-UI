"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WorkflowNetwork } from "@/components/workflow-network";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "WorkflowNetwork",
    importPath: "@/components/workflow-network",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "cycle", label: "Cycle seconds", min: 1.2, max: 6, step: 0.1, defaultValue: 2.6 },
      { kind: "select", prop: "mode", label: "Mode", options: ["loop", "once"], defaultValue: "loop" },
      { kind: "toggle", prop: "dots", label: "Dot on the beam", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Run the beams", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <WorkflowNetwork
          key={`${v.mode}-${v.autoplay}`}
          cycle={v.cycle as number}
          mode={v.mode as "loop" | "once"}
          dots={v.dots as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
