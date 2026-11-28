"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RotatingHeadline } from "@/components/rotating-headline";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RotatingHeadline",
    importPath: "@/components/rotating-headline",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "lead", label: "Lead", options: ["Built to", "Made to", "Designed to"], defaultValue: "Built to" },
      { kind: "range", prop: "interval", label: "Swap every", min: 800, max: 4000, step: 100, unit: "ms", defaultValue: 2000 },
    ],
    render: (v) => <RotatingHeadline accent={v.accent as string} lead={v.lead as string} interval={v.interval as number} />,
  };
