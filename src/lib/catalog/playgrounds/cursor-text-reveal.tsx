"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CursorTextReveal } from "@/components/cursor-text-reveal";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CursorTextReveal",
    importPath: "@/components/cursor-text-reveal",
    snippetBaseProps: ['baseText="The first rule of motion is clarity."', 'revealText="The second rule is feeling."'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "mode", label: "Lens", options: ["text", "image"], defaultValue: "text" },
      { kind: "range", prop: "maskSize", label: "Lens size", min: 60, max: 180, step: 2, unit: "px", defaultValue: 120 },
      { kind: "toggle", prop: "enableGlow", label: "Ring", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <CursorTextReveal
          key={String(v.autoplay)}
          baseText="The first rule of motion is clarity."
          revealText="The second rule is feeling."
          mode={v.mode as "text"}
          maskSize={v.maskSize as number}
          enableGlow={v.enableGlow as boolean}
          autoplay={v.autoplay as boolean}
          fontSize="40px"
          containerClassName="min-h-[260px] sm:min-h-[280px]"
        />
      </div>
    ),
  };
