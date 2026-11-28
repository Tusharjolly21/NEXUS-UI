"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { VenomButton } from "@/components/venom-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "VenomButton",
    importPath: "@/components/venom-button",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "strands", label: "Strands", min: 2, max: 7, step: 1, defaultValue: 7 },
      { kind: "range", prop: "sense", label: "Sense distance", min: 120, max: 400, step: 10, unit: "px", defaultValue: 290 },
      { kind: "range", prop: "reach", label: "Grab distance", min: 60, max: 200, step: 5, unit: "px", defaultValue: 140 },
      { kind: "select", prop: "cursor", label: "Cursor", options: ["glove", "native"], defaultValue: "glove" },
      { kind: "toggle", prop: "autoplay", label: "Ghost glove", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <VenomButton
          key={`${v.strands}-${v.cursor}-${v.autoplay}`}
          strands={v.strands as number}
          sense={v.sense as number}
          reach={v.reach as number}
          release={Math.max((v.reach as number) + 40, (v.sense as number) - 60)}
          cursor={v.cursor as "glove" | "native"}
          autoplay={v.autoplay as boolean}
          height={380}
        />
      </div>
    ),
  };
