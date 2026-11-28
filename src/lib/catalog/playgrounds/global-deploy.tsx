"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlobalDeploy } from "@/components/global-deploy";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GlobalDeploy",
    importPath: "@/components/global-deploy",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[760px]">
        <GlobalDeploy key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
