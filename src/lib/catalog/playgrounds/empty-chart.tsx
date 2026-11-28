"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { EmptyChart } from "@/components/empty-chart";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "EmptyChart",
    importPath: "@/components/empty-chart",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Caption", options: ["Revenue, last 12 months", "Sales, last 12 months", "Sign-ups, last 12 months"], defaultValue: "Revenue, last 12 months" },
      { kind: "select", prop: "prefix", label: "Prefix", options: ["$", "€", "£"], defaultValue: "$" },
      { kind: "select", prop: "suffix", label: "Suffix", options: ["k", "m", ""], defaultValue: "k" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EmptyChart key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        title={v.title as string}
        prefix={v.prefix as string}
        suffix={v.suffix as string}
      />
    ),
  };
