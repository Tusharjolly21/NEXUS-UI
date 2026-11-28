"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PriceOdometer } from "@/components/price-odometer";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PriceOdometer",
    importPath: "@/components/price-odometer",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "monthlyRate", label: "Monthly / seat", min: 5, max: 60, step: 1, defaultValue: 15 },
      { kind: "range", prop: "yearlyRate", label: "Yearly / seat", min: 4, max: 50, step: 1, defaultValue: 12 },
      { kind: "range", prop: "maxSeats", label: "Max seats", min: 10, max: 500, step: 10, defaultValue: 100 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PriceOdometer key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        accent={v.accent as string}
        monthlyRate={v.monthlyRate as number}
        yearlyRate={v.yearlyRate as number}
        maxSeats={v.maxSeats as number}
      />
    ),
  };
