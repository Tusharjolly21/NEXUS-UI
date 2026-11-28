"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BubbleTags } from "@/components/bubble-tags";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "BubbleTags",
    importPath: "@/components/bubble-tags",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "max", label: "Most tags", min: 3, max: 10, step: 1, defaultValue: 8 },
      { kind: "select", prop: "label", label: "Label", options: ["Topics", "Interests", "Skills"], defaultValue: "Topics" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <BubbleTags
          key={`${String(v.autoplay)}-${String(v.max)}`}
          autoplay={v.autoplay as boolean}
          max={v.max as number}
          label={v.label as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
