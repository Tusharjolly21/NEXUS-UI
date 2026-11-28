"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { HighlightPopover } from "@/components/highlight-popover";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "HighlightPopover",
    importPath: "@/components/highlight-popover",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[700px] justify-center">
        <HighlightPopover key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
