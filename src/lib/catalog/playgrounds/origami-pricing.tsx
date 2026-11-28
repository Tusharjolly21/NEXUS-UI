"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { OrigamiPricing } from "@/components/origami-pricing";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "OrigamiPricing",
    importPath: "@/components/origami-pricing",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "planName", label: "Plan", options: ["Nexus Pro", "Studio", "Team"], defaultValue: "Nexus Pro" },
      { kind: "select", prop: "price", label: "Price", options: ["$9", "$19", "$49"], defaultValue: "$9" },
      { kind: "toggle", prop: "autoplay", label: "Fold by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <OrigamiPricing key={String(v.autoplay)} planName={v.planName as string} price={v.price as string} autoplay={v.autoplay as boolean} />,
  };
