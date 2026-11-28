"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BendText } from "@/components/bend-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "BendText",
    importPath: "@/components/bend-text",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "text", label: "Text", options: ["PLUCK THE LINE · MAKE IT SING · ", "NEW SEASON · NEW SOUNDS · ", "HELLO THERE · "], defaultValue: "PLUCK THE LINE · MAKE IT SING · " },
      { kind: "color", prop: "accent", label: "Grab point", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Pluck by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BendText key={String(v.autoplay)} text={v.text as string} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
