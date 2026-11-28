"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AnimatedTabs } from "@/components/animated-tabs";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AnimatedTabs",
    importPath: "@/components/animated-tabs",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Switch", options: ["#34c759", "#0071e3", "#ff375f", "#ff9f0a", "#1d1d1f"], defaultValue: "#34c759" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <AnimatedTabs key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  };
