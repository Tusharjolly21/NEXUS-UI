"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { HoldToConfirm } from "@/components/hold-to-confirm";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "HoldToConfirm",
    importPath: "@/components/hold-to-confirm",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Color", options: ["#ff3b30", "#1d1d1f", "#0071e3", "#ff375f", "#30b158"], defaultValue: "#ff3b30" },
      { kind: "range", prop: "holdMs", label: "Hold for", min: 600, max: 4000, step: 100, unit: "ms", defaultValue: 1500 },
      { kind: "select", prop: "label", label: "Label", options: ["Hold to Delete", "Hold to Archive", "Hold to Leave"], defaultValue: "Hold to Delete" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <HoldToConfirm key={String(v.autoplay)} autoplay={v.autoplay as boolean} color={v.color as string} holdMs={v.holdMs as number} label={v.label as string} />,
  };
