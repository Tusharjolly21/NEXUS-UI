"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PullCord } from "@/components/pull-cord";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "PullCord",
    importPath: "@/components/pull-cord",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "defaultOn", label: "Start on", defaultValue: false },
      { kind: "select", prop: "hint", label: "Hint", options: ["Pull the cord.", "Give it a tug.", "Pull to toggle."], defaultValue: "Pull the cord." },
      { kind: "toggle", prop: "autoplay", label: "Tug by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PullCord
        key={`${String(v.autoplay)}-${String(v.defaultOn)}`}
        defaultOn={v.defaultOn as boolean}
        hint={v.hint as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
