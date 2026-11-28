"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AnimatedIcons } from "@/components/animated-icons";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AnimatedIcons",
    importPath: "@/components/animated-icons",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "iconSize", label: "Icon size", min: 16, max: 44, step: 1, unit: "px", defaultValue: 26 },
      { kind: "range", prop: "tileSize", label: "Tile size", min: 56, max: 96, step: 2, unit: "px", defaultValue: 72 },
      { kind: "range", prop: "tileRadius", label: "Tile corners", min: 0, max: 48, step: 2, unit: "px", defaultValue: 20 },
      { kind: "range", prop: "speed", label: "Animation speed", min: 0.4, max: 2.5, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AnimatedIcons
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        iconSize={v.iconSize as number}
        tileSize={v.tileSize as number}
        tileRadius={v.tileRadius as number}
        speed={v.speed as number}
      />
    ),
  };
