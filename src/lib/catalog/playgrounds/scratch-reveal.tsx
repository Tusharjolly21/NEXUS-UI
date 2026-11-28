"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ScratchReveal } from "@/components/scratch-reveal";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ScratchReveal",
    importPath: "@/components/scratch-reveal",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "headline", label: "Prize", options: ["20% off Pro", "Free month", "Free shipping"], defaultValue: "20% off Pro" },
      { kind: "color", prop: "accent", label: "Eyebrow", options: ["#bf5af2", "#ff375f", "#0a84ff", "#30b158", "#ff9f0a"], defaultValue: "#bf5af2" },
      { kind: "toggle", prop: "autoplay", label: "Scratch by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ScratchReveal key={String(v.autoplay)} headline={v.headline as string} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
