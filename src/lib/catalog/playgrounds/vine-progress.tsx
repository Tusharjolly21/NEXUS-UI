"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { VineProgress } from "@/components/vine-progress";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "VineProgress",
    importPath: "@/components/vine-progress",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[520px] justify-center">
        <VineProgress key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
