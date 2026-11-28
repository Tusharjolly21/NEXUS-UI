"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MoneyGoo } from "@/components/money-goo";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MoneyGoo",
    importPath: "@/components/money-goo",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Goo", options: ["#0071e3", "#34c759", "#ff375f", "#af52de", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "amount", label: "Amount", min: 5, max: 100, step: 5, defaultValue: 40 },
      { kind: "toggle", prop: "autoplay", label: "Send by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <MoneyGoo key={String(v.autoplay)} accent={v.accent as string} amount={v.amount as number} autoplay={v.autoplay as boolean} />,
  };
