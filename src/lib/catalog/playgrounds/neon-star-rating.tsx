"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { NeonStarRating } from "@/components/neon-star-rating";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "NeonStarRating",
    importPath: "@/components/neon-star-rating",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "question", label: "Question", options: ["How was dinner?", "Rate your stay", "How was the show?"], defaultValue: "How was dinner?" },
      { kind: "range", prop: "defaultValue", label: "Starting score", min: 0, max: 5, step: 1, defaultValue: 0 },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <NeonStarRating
          key={`${String(v.autoplay)}-${String(v.defaultValue)}`}
          autoplay={v.autoplay as boolean}
          question={v.question as string}
          defaultValue={v.defaultValue as number}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
