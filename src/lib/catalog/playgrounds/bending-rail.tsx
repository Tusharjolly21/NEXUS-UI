"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BendingRail } from "@/components/bending-rail";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "BendingRail",
    importPath: "@/components/bending-rail",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#34c759", "#ff9f0a", "#ff375f", "#af52de"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Volume", "Brightness", "Opacity"], defaultValue: "Volume" },
      { kind: "toggle", prop: "autoplay", label: "Tug by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BendingRail key={String(v.autoplay)} accent={v.accent as string} label={v.label as string} autoplay={v.autoplay as boolean} />,
  };
