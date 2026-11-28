"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LiquidDial } from "@/components/liquid-dial";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "LiquidDial",
    importPath: "@/components/liquid-dial",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30d158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "color", prop: "color", label: "Blob", options: ["#1d1d1f", "#3a3a3c", "#5e5ce6", "#0071e3"], defaultValue: "#1d1d1f" },
      { kind: "toggle", prop: "autoplay", label: "Browse by itself", defaultValue: false, startOn: true },
    ],
    // Defaults are passed as undefined so the component's own light/dark colours apply.
    render: (v) => (
      <LiquidDial
        key={String(v.autoplay)}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        color={v.color === "#1d1d1f" ? undefined : (v.color as string)}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
