"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ContextMeter } from "@/components/context-meter";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ContextMeter",
    importPath: "@/components/context-meter",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "limit", label: "Window", min: 120, max: 400, step: 20, unit: "K", defaultValue: 200 },
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ContextMeter key={`${v.limit}-${v.autoplay}`} limit={v.limit as number} autoplay={v.autoplay as boolean} />,
  };
