"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GenerateImage } from "@/components/generate-image";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GenerateImage",
    importPath: "@/components/generate-image",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "prompt", label: "Prompt", options: ["Pink dusk over soft hills", "Morning valley, mint and sky", "Moonlit ridge, deep teal", "Desert at golden hour"], defaultValue: "Pink dusk over soft hills" },
      { kind: "toggle", prop: "autoplay", label: "Generate by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <GenerateImage key={`${v.prompt}-${v.autoplay}`} prompt={v.prompt as string} autoplay={v.autoplay as boolean} />,
  };
