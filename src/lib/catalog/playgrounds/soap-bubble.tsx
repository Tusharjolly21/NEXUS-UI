"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SoapBubble } from "@/components/soap-bubble";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SoapBubble",
    importPath: "@/components/soap-bubble",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "to", label: "Kudos to", options: ["Priya", "Sam", "the team"], defaultValue: "Priya" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[440px] justify-center">
        <SoapBubble
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          to={v.to as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
