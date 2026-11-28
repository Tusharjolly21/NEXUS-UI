"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { VoiceOrb } from "@/components/voice-orb";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "VoiceOrb",
    importPath: "@/components/voice-orb",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#bf5af2", "#ff375f", "#30d158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Cycle states", defaultValue: false, startOn: true },
    ],
    render: (v) => <VoiceOrb key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
