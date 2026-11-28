"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DustSnap } from "@/components/dust-snap";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "DustSnap",
    importPath: "@/components/dust-snap",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "text", label: "Word", options: ["NexusUI", "Goodbye", "Deleted", "Gone"], defaultValue: "NexusUI" },
      { kind: "select", prop: "theme", label: "Theme", options: ["light", "dark"], defaultValue: "light" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
      { kind: "range", prop: "volume", label: "Volume", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.7 },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[640px]">
        <DustSnap
          key={`${String(v.autoplay)}-${String(v.text)}`}
          autoplay={v.autoplay as boolean}
          text={(v.text as string) || "NexusUI"}
          theme={v.theme as "light"}
          enableSound={v.enableSound as boolean}
          volume={v.volume as number}
        />
      </div>
    ),
  };
