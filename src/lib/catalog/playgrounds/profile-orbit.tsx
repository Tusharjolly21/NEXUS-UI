"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ProfileOrbit } from "@/components/profile-orbit";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ProfileOrbit",
    importPath: "@/components/profile-orbit",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "autoRotateInterval", label: "Step every", min: 1200, max: 6000, step: 100, unit: "ms", defaultValue: 2800 },
      { kind: "select", prop: "hint", label: "Hint", options: ["Drag the ring or tap a face.", "Meet the team.", ""], defaultValue: "Drag the ring or tap a face." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ProfileOrbit
        key={String(v.autoplay)}
        autoRotateInterval={v.autoRotateInterval as number}
        hint={v.hint as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
