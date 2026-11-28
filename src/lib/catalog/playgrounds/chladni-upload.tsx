"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ChladniUpload } from "@/components/chladni-upload";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ChladniUpload",
    importPath: "@/components/chladni-upload",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "fileName", label: "File name", options: ["mix-final.wav", "album-master.wav", "demo-take-3.aiff"], defaultValue: "mix-final.wav" },
      { kind: "range", prop: "fileSize", label: "File size", min: 2, max: 120, step: 0.5, unit: "MB", defaultValue: 24.6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ChladniUpload key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        fileName={v.fileName as string}
        fileSize={v.fileSize as number}
      />
    ),
  };
