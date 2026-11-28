"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PolaroidDevelop } from "@/components/polaroid-develop";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PolaroidDevelop",
    importPath: "@/components/polaroid-develop",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "sensitivity", label: "Shake sensitivity", min: 0.3, max: 4, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "swing", label: "Swing", min: 0, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "elasticity", label: "Drag stretch", min: 0.1, max: 1, step: 0.05, defaultValue: 0.5 },
      { kind: "toggle", prop: "selfDevelop", label: "Develops on its own", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Shake by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PolaroidDevelop
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        sensitivity={v.sensitivity as number}
        swing={v.swing as number}
        elasticity={v.elasticity as number}
        selfDevelop={v.selfDevelop as boolean}
      />
    ),
  };
