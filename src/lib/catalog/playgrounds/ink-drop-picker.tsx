"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { InkDropPicker } from "@/components/ink-drop-picker";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "InkDropPicker",
    importPath: "@/components/ink-drop-picker",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "label", label: "Label", options: ["Accent colour", "Brand colour", "Theme"], defaultValue: "Accent colour" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[340px] justify-center">
        <InkDropPicker
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          label={v.label as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
