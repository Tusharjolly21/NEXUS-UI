"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { NotificationStack } from "@/components/notification-stack";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "NotificationStack",
    importPath: "@/components/notification-stack",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "duration", label: "Stays for", min: 1000, max: 10000, step: 200, unit: "ms", defaultValue: 4200 },
      { kind: "range", prop: "visible", label: "Toasts shown when folded", min: 1, max: 5, step: 1, defaultValue: 3 },
      { kind: "range", prop: "peek", label: "Peek when folded", min: 4, max: 30, step: 1, unit: "px", defaultValue: 13 },
      { kind: "range", prop: "gap", label: "Gap when spread", min: 0, max: 20, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "stiffness", label: "Spring stiffness", min: 150, max: 800, step: 10, defaultValue: 380 },
      { kind: "select", prop: "direction", label: "Stack grows", options: ["up", "down"], defaultValue: "up" },
      { kind: "toggle", prop: "autoplay", label: "Push samples", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <NotificationStack
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        duration={v.duration as number}
        visible={v.visible as number}
        peek={v.peek as number}
        gap={v.gap as number}
        stiffness={v.stiffness as number}
        direction={v.direction as "up" | "down"}
      />
    ),
  };
