"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlassDrop } from "@/components/glass-drop";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GlassDrop",
    importPath: "@/components/glass-drop",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "ending", label: "Ending", options: ["logo", "logo-text"], defaultValue: "logo" },
      { kind: "select", prop: "theme", label: "Theme", options: ["dark", "light", "blue"], defaultValue: "dark" },
      { kind: "range", prop: "depth", label: "Glass depth", min: 0, max: 6, step: 0.1, unit: "", defaultValue: 2.9 },
      { kind: "toggle", prop: "tint", label: "Cast logo in the theme's ink", defaultValue: false },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: false },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[860px]">
        <GlassDrop
          key={`${String(v.ending)}-${String(v.theme)}-${String(v.tint)}-${String(v.loop)}`}
          depth={v.depth as number}
          ending={v.ending as "logo"}
          theme={v.theme as "dark"}
          tint={v.tint as boolean}
          loop={v.loop as boolean}
          height={420}
          controls={false}
        />
      </div>
    ),
  };
