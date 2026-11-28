"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DominoSelect } from "@/components/domino-select";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "DominoSelect",
    importPath: "@/components/domino-select",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "rows", label: "Rows", min: 2, max: 7, step: 1, defaultValue: 7 },
      { kind: "range", prop: "stagger", label: "Time between rows", min: 0.02, max: 0.3, step: 0.005, unit: "s", defaultValue: 0.075 },
      { kind: "range", prop: "lean", label: "Topple depth", min: 0.3, max: 1.4, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "enableSound", label: "Knock sounds", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Topple by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DominoSelect
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        rows={v.rows as number}
        stagger={v.stagger as number}
        lean={v.lean as number}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        enableSound={v.enableSound as boolean}
      />
    ),
  };
