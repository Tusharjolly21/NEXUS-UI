"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FeatureToolsCard } from "@/components/feature-tools-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "FeatureToolsCard",
    importPath: "@/components/feature-tools-card",
    snippetBaseProps: ['title="Connects with your stack"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "tiltStrength", label: "Tilt", min: 0, max: 20, step: 1, unit: "°", defaultValue: 8 },
      { kind: "range", prop: "magneticStrength", label: "Magnet force", min: 0, max: 1, step: 0.05, defaultValue: 0.4 },
      { kind: "range", prop: "magneticRadius", label: "Magnet radius", min: 40, max: 240, step: 5, unit: "px", defaultValue: 120 },
      { kind: "range", prop: "orbitSpeed", label: "Orbit period", min: 8, max: 90, step: 1, unit: "s", defaultValue: 36 },
      { kind: "toggle", prop: "enableTilt", label: "Tilt", defaultValue: true },
      { kind: "toggle", prop: "enableMagnetic", label: "Magnetic icons", defaultValue: true },
      { kind: "toggle", prop: "enableOrbit", label: "Orbit", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Autoplay", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <FeatureToolsCard
        title="Connects with your stack"
        description="Mail, chat, calendar, docs and storage, synced the moment they change."
        tiltStrength={v.tiltStrength as number}
        magneticStrength={v.magneticStrength as number}
        magneticRadius={v.magneticRadius as number}
        orbitSpeed={v.orbitSpeed as number}
        enableTilt={v.enableTilt as boolean}
        enableMagnetic={v.enableMagnetic as boolean}
        enableOrbit={v.enableOrbit as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
