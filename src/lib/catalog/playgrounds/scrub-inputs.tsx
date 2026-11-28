"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ScrubInputs } from "@/components/scrub-inputs";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ScrubInputs",
    importPath: "@/components/scrub-inputs",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Scrub by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ScrubInputs key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
