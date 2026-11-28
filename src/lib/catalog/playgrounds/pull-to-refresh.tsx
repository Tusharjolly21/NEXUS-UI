"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PullToRefresh } from "@/components/pull-to-refresh";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PullToRefresh",
    importPath: "@/components/pull-to-refresh",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "pullDistance", label: "Pull distance", min: 60, max: 120, step: 5, unit: "px", defaultValue: 90 },
      { kind: "range", prop: "refreshTime", label: "Refresh time", min: 0.5, max: 3, step: 0.1, unit: "s", defaultValue: 1.3 },
      { kind: "range", prop: "stretch", label: "Stretch", min: 0, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "bounce", label: "Bounce", min: 0.5, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "elasticity", label: "Card follows pointer", min: 0.4, max: 1, step: 0.05, defaultValue: 0.55 },
      { kind: "toggle", prop: "autoplay", label: "Pull by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PullToRefresh
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        pullDistance={v.pullDistance as number}
        refreshTime={v.refreshTime as number}
        stretch={v.stretch as number}
        bounce={v.bounce as number}
        elasticity={v.elasticity as number}
      />
    ),
  };
