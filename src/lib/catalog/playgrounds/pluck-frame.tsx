"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PluckFrame } from "@/components/pluck-frame";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "PluckFrame",
    importPath: "@/components/pluck-frame",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "theme", label: "Theme", options: ["dark", "light"], defaultValue: "dark" },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <PluckFrame key={String(v.autoplay)} autoplay={v.autoplay as boolean} theme={v.theme as "dark"} />
      </div>
    ),
  };
