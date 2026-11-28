"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ContributionSkyline } from "@/components/contribution-skyline";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ContributionSkyline",
    importPath: "@/components/contribution-skyline",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[980px] justify-center">
        <ContributionSkyline
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
