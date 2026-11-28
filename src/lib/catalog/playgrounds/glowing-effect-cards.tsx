"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlowingCardsLayout } from "@/components/glowing-effect-cards";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GlowingCardsLayout",
    importPath: "@/components/glowing-effect-cards",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "hint", label: "Caption", options: ["Move across the cards.", "Hover a card.", ""], defaultValue: "Move across the cards." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GlowingCardsLayout key={String(v.autoplay)} hint={v.hint as string} autoplay={v.autoplay as boolean} className="max-w-[560px]" />
    ),
  };
