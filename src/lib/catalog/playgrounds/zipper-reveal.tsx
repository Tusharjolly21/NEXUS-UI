"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ZipperReveal } from "@/components/zipper-reveal";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ZipperReveal",
    importPath: "@/components/zipper-reveal",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "code", label: "Code", options: ["NXS-8F2Q-PRO", "LAUNCH-7K4M", "WELCOME-2026"], defaultValue: "NXS-8F2Q-PRO" },
      { kind: "toggle", prop: "autoplay", label: "Zip by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ZipperReveal key={String(v.autoplay)} code={v.code as string} autoplay={v.autoplay as boolean} />,
  };
