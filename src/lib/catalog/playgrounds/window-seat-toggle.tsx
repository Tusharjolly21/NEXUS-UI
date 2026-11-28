"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WindowSeatToggle } from "@/components/window-seat-toggle";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "WindowSeatToggle",
    importPath: "@/components/window-seat-toggle",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[560px] justify-center">
        <WindowSeatToggle key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
