"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ComponentLayers } from "@/components/component-layers";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ComponentLayers",
    importPath: "@/components/component-layers",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#bf5af2", "#30d158", "#ff375f", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Explode by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ComponentLayers key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
