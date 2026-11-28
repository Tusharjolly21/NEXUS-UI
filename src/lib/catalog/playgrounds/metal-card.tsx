"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MetalCard } from "@/components/metal-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "MetalCard",
    importPath: "@/components/metal-card",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "finish", label: "Finish", options: ["titanium",  "black",  "rose"], defaultValue: "titanium" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[460px] justify-center">
        <MetalCard
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          finish={v.finish as "titanium" | "black" | "rose"}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
