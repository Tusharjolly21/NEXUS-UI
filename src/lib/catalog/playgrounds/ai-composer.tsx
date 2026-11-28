"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AIComposer } from "@/components/ai-composer";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "AIComposer",
    importPath: "@/components/ai-composer",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "greeting", label: "Greeting", options: ["What can I help with?", "Ask the docs", "Where should we start?"], defaultValue: "What can I help with?" },
      { kind: "toggle", prop: "autoplay", label: "Type and send by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[560px]">
        <AIComposer key={String(v.autoplay)} greeting={v.greeting as string} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
