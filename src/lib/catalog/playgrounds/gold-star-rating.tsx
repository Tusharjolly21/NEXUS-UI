"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GoldStarRating } from "@/components/gold-star-rating";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GoldStarRating",
    importPath: "@/components/gold-star-rating",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "question", label: "Question", options: ["Rate your order", "How was your stay?", "Rate this lesson"], defaultValue: "Rate your order" },
      { kind: "range", prop: "defaultValue", label: "Starting score", min: 0, max: 5, step: 1, defaultValue: 0 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <GoldStarRating
          key={`${String(v.autoplay)}-${String(v.defaultValue)}`}
          autoplay={v.autoplay as boolean}
          question={v.question as string}
          defaultValue={v.defaultValue as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
