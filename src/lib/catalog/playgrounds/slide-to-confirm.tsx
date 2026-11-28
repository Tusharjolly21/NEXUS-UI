"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SlideToConfirm } from "@/components/slide-to-confirm";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SlideToConfirm",
    importPath: "@/components/slide-to-confirm",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "range", prop: "threshold", label: "Threshold", min: 0.5, max: 1, step: 0.05, defaultValue: 0.9 },
      { kind: "range", prop: "resetAfter", label: "Reset after", min: 0, max: 5000, step: 100, unit: "ms", defaultValue: 2200 },
      { kind: "color", prop: "successColor", label: "Success", options: ["#248a3d", "#0071e3", "#1d1d1f", "#8944ab", "#b25000"], defaultValue: "#248a3d" },
      { kind: "select", prop: "label", label: "Label", options: ["Slide to confirm", "Slide to pay", "Slide to unlock"], defaultValue: "Slide to confirm" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SlideToConfirm key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        size={v.size as "md"}
        threshold={v.threshold as number}
        resetAfter={v.resetAfter as number}
        successColor={v.successColor as string}
        label={v.label as string}
        onConfirm={() => new Promise<void>((resolve) => setTimeout(resolve, 900))}
      />
    ),
  };
