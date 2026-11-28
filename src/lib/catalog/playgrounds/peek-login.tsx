"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PeekLogin } from "@/components/peek-login";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PeekLogin",
    importPath: "@/components/peek-login",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Face", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PeekLogin key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  };
