"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { HoverHighlightText } from "@/components/hover-highlight-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "HoverHighlightText",
    importPath: "@/components/hover-highlight-text",
    snippetBaseProps: ['text="Build interfaces people remember long after they close the tab."'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "markerColor", label: "Marker", options: ["#ffd60a", "#0071e355", "#30b15855", "#ff375f55", "#bf5af255"], defaultValue: "#ffd60a" },
      { kind: "range", prop: "reach", label: "Reach", min: 8, max: 140, step: 2, unit: "px", defaultValue: 40 },
      { kind: "range", prop: "linger", label: "Linger", min: 0.1, max: 3, step: 0.1, unit: "s", defaultValue: 0.9 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[520px] justify-center">
        <HoverHighlightText
          key={String(v.autoplay)}
          text="Build interfaces people remember long after they close the tab."
          baseClassName="max-w-[15ch] text-[36px] sm:text-[44px]"
          markerColor={v.markerColor === "#ffd60a" ? undefined : (v.markerColor as string)}
          reach={v.reach as number}
          linger={v.linger as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
