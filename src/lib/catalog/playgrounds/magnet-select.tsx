"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MagnetSelect } from "@/components/magnet-select";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MagnetSelect",
    importPath: "@/components/magnet-select",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultValue", label: "Start on", options: ["here", "focus", "meet", "lunch", "travel", "sick", "away"], defaultValue: "here" },
      { kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <MagnetSelect key={`${v.defaultValue}-${v.autoplay}`} defaultValue={v.defaultValue as string} autoplay={v.autoplay as boolean} />,
  };
