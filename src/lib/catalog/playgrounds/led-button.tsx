"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LEDButton } from "@/components/led-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LEDButton",
    importPath: "@/components/led-button",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "label", label: "Label", options: ["Copy prompt", "Download", "Subscribe"], defaultValue: "Copy prompt" },
      { kind: "select", prop: "done", label: "Done text", options: ["Copied", "Done", "Sent"], defaultValue: "Copied" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <LEDButton
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          label={v.label as string}
          done={v.done as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
