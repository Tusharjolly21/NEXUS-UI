"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WarpCTA } from "@/components/warp-cta";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "WarpCTA",
    importPath: "@/components/warp-cta",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "label", label: "Label", options: ["Deploy at warp speed", "Launch", "Ship it"], defaultValue: "Deploy at warp speed" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[440px] justify-center">
        <WarpCTA
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          label={v.label as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
