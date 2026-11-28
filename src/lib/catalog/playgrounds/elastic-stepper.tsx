"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ElasticStepper } from "@/components/elastic-stepper";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ElasticStepper",
    importPath: "@/components/elastic-stepper",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "max", label: "Max", min: 3, max: 12, step: 1, defaultValue: 8 },
      { kind: "select", prop: "label", label: "Label", options: ["Guests", "Seats", "Tickets"], defaultValue: "Guests" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ElasticStepper autoplay={v.autoplay as boolean} key={`${v.max as number}-${String(v.autoplay)}`} accent={v.accent as string} max={v.max as number} label={v.label as string} />,
  };
