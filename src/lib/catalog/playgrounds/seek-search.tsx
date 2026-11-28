"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SeekSearch } from "@/components/seek-search";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SeekSearch",
    importPath: "@/components/seek-search",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["Search files", "Search docs", "Find a teammate"], defaultValue: "Search files" },
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SeekSearch key={String(v.autoplay)} placeholder={v.placeholder as string} autoplay={v.autoplay as boolean} />,
  };
