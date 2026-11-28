"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StretchNav } from "@/components/stretch-nav";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StretchNav",
    importPath: "@/components/stretch-nav",
    defaultFill: "light",
    controls: [{ kind: "range", prop: "defaultIndex", label: "Start at", min: 0, max: 4, step: 1, defaultValue: 0 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StretchNav autoplay={v.autoplay as boolean} key={`${v.defaultIndex as number}-${String(v.autoplay)}`} defaultIndex={v.defaultIndex as number} />,
  };
