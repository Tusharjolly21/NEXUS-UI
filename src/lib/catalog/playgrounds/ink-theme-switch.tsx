"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { InkThemeSwitch } from "@/components/ink-theme-switch";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "InkThemeSwitch",
    importPath: "@/components/ink-theme-switch",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "defaultDark", label: "Start dark", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Flip by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <InkThemeSwitch key={`${String(v.autoplay)}-${String(v.defaultDark)}`} defaultDark={v.defaultDark as boolean} autoplay={v.autoplay as boolean} />
    ),
  };
