"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FoldNote } from "@/components/fold-note";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FoldNote",
    importPath: "@/components/fold-note",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "amount", label: "Amount", options: ["50", "25", "100"], defaultValue: "50" },
      { kind: "select", prop: "backLabel", label: "Back", options: ["Thanks", "Saved", "Enjoy"], defaultValue: "Thanks" },
      { kind: "toggle", prop: "autoplay", label: "Fold by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <FoldNote key={String(v.autoplay)} amount={v.amount as string} backLabel={v.backLabel as string} autoplay={v.autoplay as boolean} />,
  };
