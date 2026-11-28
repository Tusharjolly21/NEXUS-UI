"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FlapClock } from "@/components/flap-clock";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FlapClock",
    importPath: "@/components/flap-clock",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[680px] justify-center">
        <FlapClock key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
