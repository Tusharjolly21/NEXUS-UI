"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PeelDelete } from "@/components/peel-delete";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "PeelDelete",
    importPath: "@/components/peel-delete",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "holdMs", label: "Hold time (ms)", min: 500, max: 2000, step: 100, defaultValue: 1000 },
      { kind: "range", prop: "undoSeconds", label: "Undo seconds", min: 3, max: 10, step: 1, defaultValue: 5 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <PeelDelete
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          holdMs={v.holdMs as number}
          undoSeconds={v.undoSeconds as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
