"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LitKeyboard } from "@/components/lit-keyboard";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "LitKeyboard",
    importPath: "@/components/lit-keyboard",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "glow", label: "Glow", options: ["#ff9f0a", "#0a84ff", "#30d158", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <LitKeyboard key={String(v.autoplay)} glow={v.glow as string} autoplay={v.autoplay as boolean} />,
  };
