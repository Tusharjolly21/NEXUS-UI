"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlyphFlow } from "@/components/glyph-flow";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GlyphFlow",
    importPath: "@/components/glyph-flow",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[520px] justify-center">
        <GlyphFlow
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
