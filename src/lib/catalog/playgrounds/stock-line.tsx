"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StockLine } from "@/components/stock-line";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StockLine",
    importPath: "@/components/stock-line",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "smooth", label: "Smooth curve", defaultValue: true },
      { kind: "toggle", prop: "fill", label: "Area fill", defaultValue: true },
      { kind: "color", prop: "up", label: "Up colour", options: ["#30d158", "#0a84ff", "#64d2ff", "#bf5af2"], defaultValue: "#30d158" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StockLine key={String(v.autoplay)} autoplay={v.autoplay as boolean} smooth={v.smooth as boolean} fill={v.fill as boolean} up={v.up as string} />,
  };
