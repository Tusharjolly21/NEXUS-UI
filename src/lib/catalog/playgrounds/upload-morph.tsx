"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { UploadMorph } from "@/components/upload-morph";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "UploadMorph",
    importPath: "@/components/upload-morph",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "fileName", label: "File", options: ["Q3-report.pdf", "holiday.mov", "design-v2.fig"], defaultValue: "Q3-report.pdf" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[340px] justify-center">
        <UploadMorph
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          fileName={v.fileName as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
