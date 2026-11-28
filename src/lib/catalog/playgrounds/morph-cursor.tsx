"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MorphCursor } from "@/components/morph-cursor";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MorphCursor",
    importPath: "@/components/morph-cursor",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Caret", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "buttonLabel", label: "Button", options: ["Start a project", "New board", "Invite team"], defaultValue: "Start a project" },
      { kind: "toggle", prop: "autoplay", label: "Tour by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <MorphCursor key={String(v.autoplay)} accent={v.accent as string} buttonLabel={v.buttonLabel as string} autoplay={v.autoplay as boolean} />,
  };
