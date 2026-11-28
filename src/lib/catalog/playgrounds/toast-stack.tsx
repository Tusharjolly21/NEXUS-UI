"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ToastStack } from "@/components/toast-stack";
import type { Playground } from "../playground-types";

const DEMO_TOASTS = [
  { id: "t1", type: "success" as const, title: "Invoice sent", description: "acme@studio.co will get it shortly." },
  { id: "t2", type: "info" as const, title: "Draft saved", description: "Last edit 2 seconds ago.", action: { label: "Undo" } },
  { id: "t3", type: "error" as const, title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
];

export const playground: Playground = {
    componentName: "ToastStack",
    importPath: "@/components/toast-stack",
    snippetBaseProps: ["toasts={toasts}", "onDismiss={dismiss}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "expand", label: "Expand", options: ["hover", "always"], defaultValue: "hover" },
      { kind: "select", prop: "position", label: "Grow from", options: ["bottom", "top"], defaultValue: "bottom" },
      { kind: "range", prop: "max", label: "Visible", min: 1, max: 3, step: 1, defaultValue: 3 },
      { kind: "range", prop: "width", label: "Width", min: 280, max: 420, step: 4, unit: "px", defaultValue: 340 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ToastStack key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        toasts={DEMO_TOASTS}
        onDismiss={() => {}}
        expand={v.expand as "hover"}
        position={v.position as "bottom"}
        max={v.max as number}
        width={v.width as number}
      />
    ),
  };
