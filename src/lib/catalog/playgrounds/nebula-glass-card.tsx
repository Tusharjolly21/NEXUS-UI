"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { NebulaGlassCard } from "@/components/nebula-glass-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "NebulaGlassCard",
    importPath: "@/components/nebula-glass-card",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "tiltStrength", label: "Tilt", min: 0, max: 24, step: 1, unit: "°", defaultValue: 12 },
      { kind: "select", prop: "title", label: "Title", options: ["Render anywhere", "Ship at the edge", "Built for speed"], defaultValue: "Render anywhere" },
      { kind: "select", prop: "cta", label: "Button", options: ["Upgrade", "Start free", "Deploy now"], defaultValue: "Upgrade" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <NebulaGlassCard
        key={String(v.autoplay)}
        tiltStrength={v.tiltStrength as number}
        title={v.title as string}
        cta={v.cta as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
