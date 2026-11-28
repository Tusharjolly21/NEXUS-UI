"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RadioCards } from "@/components/radio-cards";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RadioCards",
    importPath: "@/components/radio-cards",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <RadioCards key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  };
