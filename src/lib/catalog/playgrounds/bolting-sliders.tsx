"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BoltingSliders } from "@/components/bolting-sliders";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "BoltingSliders",
    importPath: "@/components/bolting-sliders",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff375f", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Jump by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BoltingSliders key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
