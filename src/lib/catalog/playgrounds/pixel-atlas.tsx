"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PixelAtlas } from "@/components/pixel-atlas";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "PixelAtlas",
    importPath: "@/components/pixel-atlas",
    defaultFill: "dark",
    snippetBaseProps: ["height={520}"],
    controls: [
      { kind: "toggle", prop: "tour", label: "Tour the places", defaultValue: true },
      { kind: "range", prop: "resolution", label: "Pixel size", min: 1.6, max: 6, step: 0.2, unit: "°", defaultValue: 3.2 },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[1000px] overflow-hidden rounded-3xl">
        <PixelAtlas key={`${v.tour}-${v.resolution}`} height={520} tour={v.tour as boolean} resolution={v.resolution as number} />
      </div>
    ),
  };
