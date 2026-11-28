"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StaggerMenu } from "@/components/stagger-menu";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StaggerMenu",
    importPath: "@/components/stagger-menu",
    defaultFill: "light",
    controls: [{ kind: "select", prop: "label", label: "Label", options: ["Share", "Export", "More"], defaultValue: "Share" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex justify-center pt-6">
        <StaggerMenu key={String(v.autoplay)} autoplay={v.autoplay as boolean} label={v.label as string} />
      </div>
    ),
  };
