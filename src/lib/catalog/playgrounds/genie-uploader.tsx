"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GenieUploader } from "@/components/genie-uploader";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GenieUploader",
    importPath: "@/components/genie-uploader",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[600px] justify-center">
        <GenieUploader key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
