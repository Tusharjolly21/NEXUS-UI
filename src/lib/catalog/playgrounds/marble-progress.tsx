"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import * as React from "react";
import type { Playground } from "../playground-types";

const MarbleProgress = React.lazy(() => import("@/components/marble-progress").then((m) => ({ default: m.MarbleProgress })));

export const playground: Playground = {
    componentName: "MarbleProgress",
    importPath: "@/components/marble-progress",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "marbleSize", label: "Marble size", min: 6, max: 11, step: 0.5, unit: "px", defaultValue: 9 },
      { kind: "range", prop: "bounciness", label: "Bounciness", min: 0.05, max: 0.85, step: 0.05, defaultValue: 0.45 },
      { kind: "range", prop: "gravity", label: "Gravity", min: 0.4, max: 1.6, step: 0.1, defaultValue: 1 },
      { kind: "color", prop: "glowColor", label: "Full-jar glow", options: ["#30d158", "#0071e3", "#ff9f0a", "#ff375f", "#bf5af2"], defaultValue: "#30d158" },
      { kind: "toggle", prop: "autoplay", label: "Tick by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <MarbleProgress
          key={String(v.autoplay)}
          autoplay={v.autoplay as boolean}
          marbleSize={v.marbleSize as number}
          bounciness={v.bounciness as number}
          gravity={v.gravity as number}
          glowColor={v.glowColor as string}
        />
      </React.Suspense>
    ),
  };
