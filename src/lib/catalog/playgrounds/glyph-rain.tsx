"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlyphRain } from "@/components/glyph-rain";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GlyphRain",
    importPath: "@/components/glyph-rain",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "code", label: "Code", options: ["404", "500", "410"], defaultValue: "404" },
      { kind: "select", prop: "title", label: "Title", options: ["Nothing at this address", "This page wandered off", "Lost in the rain"], defaultValue: "Nothing at this address" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[880px] justify-center">
        <GlyphRain
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          code={v.code as string}
          title={v.title as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
