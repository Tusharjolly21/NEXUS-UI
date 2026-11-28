"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PaperclipAttach } from "@/components/paperclip-attach";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "PaperclipAttach",
    importPath: "@/components/paperclip-attach",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[600px] justify-center">
        <PaperclipAttach key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
