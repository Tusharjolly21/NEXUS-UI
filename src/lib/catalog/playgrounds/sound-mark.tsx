"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SoundMark } from "@/components/sound-mark";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SoundMark",
    importPath: "@/components/sound-mark",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "word", label: "Word", options: ["sound", "studio", "listen", "nexus"], defaultValue: "sound" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SoundMark key={String(v.autoplay)} autoplay={v.autoplay as boolean} word={v.word as string} />,
  };
