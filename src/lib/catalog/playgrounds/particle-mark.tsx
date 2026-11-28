"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ParticleMark } from "@/components/particle-mark";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ParticleMark",
    importPath: "@/components/particle-mark",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "text", label: "Word", options: ["motion", "hello", "nexus", "spring"], defaultValue: "motion" },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ParticleMark key={String(v.autoplay)} text={v.text as string} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
