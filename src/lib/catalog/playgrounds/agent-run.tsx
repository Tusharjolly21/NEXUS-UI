"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AgentRun } from "@/components/agent-run";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AgentRun",
    importPath: "@/components/agent-run",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "task", label: "Task", options: ["Fix the failing checkout test", "Repair the flaky cart test", "Unbreak the discount tests"], defaultValue: "Fix the failing checkout test" },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AgentRun key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        task={v.task as string}
        width={v.width as number}
      />
    ),
  };
