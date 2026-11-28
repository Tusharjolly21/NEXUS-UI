"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StickerToss } from "@/components/sticker-toss";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StickerToss",
    importPath: "@/components/sticker-toss",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Centre", options: ["#c8f560", "#ff375f", "#0a84ff", "#ff9f0a", "#bf5af2"], defaultValue: "#c8f560" },
      { kind: "select", prop: "text", label: "Ring text", options: ["NEXUS UI · MADE TO MOVE · ", "STUDIO · EST. 2026 · ", "THROW ME · CATCH ME · "], defaultValue: "NEXUS UI · MADE TO MOVE · " },
      { kind: "toggle", prop: "autoplay", label: "Toss by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StickerToss key={String(v.autoplay)} accent={v.accent as string} text={v.text as string} autoplay={v.autoplay as boolean} />,
  };
