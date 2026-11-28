"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AskNexusInput } from "@/components/ask-nexus-input";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AskNexusInput",
    importPath: "@/components/ask-nexus-input",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Ask Nexus UI anything", "Ask the docs", "What's on your mind?"], defaultValue: "Ask Nexus UI anything" },
      { kind: "range", prop: "placeholderInterval", label: "Rotate every", min: 1200, max: 5000, step: 100, unit: "ms", defaultValue: 2800 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AskNexusInput
        key={String(v.autoplay)}
        title={v.title as string}
        placeholderInterval={v.placeholderInterval as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
