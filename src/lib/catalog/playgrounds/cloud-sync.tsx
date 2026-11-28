"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CloudSync } from "@/components/cloud-sync";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "CloudSync",
    importPath: "@/components/cloud-sync",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[480px]">
        <CloudSync key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
