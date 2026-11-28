"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ContextMenu } from "@/components/context-menu";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ContextMenu",
    importPath: "@/components/context-menu",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Window title", options: ["Q4 Launch", "Design", "Photos"], defaultValue: "Q4 Launch" },
      { kind: "toggle", prop: "autoplay", label: "Right-click by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[600px]">
        <ContextMenu key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
