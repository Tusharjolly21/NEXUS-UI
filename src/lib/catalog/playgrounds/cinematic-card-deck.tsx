"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CinematicCardDeck } from "@/components/cinematic-card-deck";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "CinematicCardDeck",
    importPath: "@/components/cinematic-card-deck",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "intensity", label: "Intensity", options: ["subtle", "standard", "cinematic"], defaultValue: "standard" },
      { kind: "select", prop: "exitDirection", label: "Peel", options: ["up", "down"], defaultValue: "up" },
      { kind: "toggle", prop: "showAmbientGlow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CinematicCardDeck
        key={String(v.autoplay)}
        intensity={v.intensity as "standard"}
        exitDirection={v.exitDirection as "up"}
        showAmbientGlow={v.showAmbientGlow as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
