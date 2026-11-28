"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { HaloHero } from "@/components/halo-hero";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "HaloHero",
    importPath: "@/components/halo-hero",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "palette", label: "Palette", options: ["ember",  "ice",  "aurora"], defaultValue: "ember" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[1100px] justify-center">
        <HaloHero
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          palette={v.palette as "ember" | "ice" | "aurora"}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
