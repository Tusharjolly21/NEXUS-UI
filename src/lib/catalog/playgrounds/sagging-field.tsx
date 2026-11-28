"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SaggingField } from "@/components/sagging-field";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SaggingField",
    importPath: "@/components/sagging-field",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "range", prop: "maxChars", label: "Full sag at", min: 12, max: 60, step: 1, unit: " chars", defaultValue: 34 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SaggingField key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} maxChars={v.maxChars as number} />,
  };
