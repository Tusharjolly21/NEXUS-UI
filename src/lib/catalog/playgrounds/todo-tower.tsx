"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TodoTower } from "@/components/todo-tower";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TodoTower",
    importPath: "@/components/todo-tower",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "overhang", label: "Tip after", min: 12, max: 48, step: 2, unit: "px", defaultValue: 24 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <TodoTower key={String(v.autoplay)} overhang={v.overhang as number} autoplay={v.autoplay as boolean} />,
  };
