"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import * as React from "react";
import type { Playground } from "../playground-types";

const TagPit = React.lazy(() => import("@/components/tag-pit").then((m) => ({ default: m.TagPit })));

export const playground: Playground = {
    componentName: "TagPit",
    importPath: "@/components/tag-pit",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "min", label: "Picks needed", min: 1, max: 6, step: 1, defaultValue: 3 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <TagPit key={String(v.autoplay)} accent={v.accent as string} min={v.min as number} autoplay={v.autoplay as boolean} />
      </React.Suspense>
    ),
  };
