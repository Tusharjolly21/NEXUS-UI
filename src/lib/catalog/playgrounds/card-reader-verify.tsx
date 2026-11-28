"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CardReaderVerify } from "@/components/card-reader-verify";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "CardReaderVerify",
    importPath: "@/components/card-reader-verify",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <CardReaderVerify key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
