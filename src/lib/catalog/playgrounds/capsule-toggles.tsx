"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CapsuleToggles } from "@/components/capsule-toggles";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CapsuleToggles",
    importPath: "@/components/capsule-toggles",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Controls", "Quick settings", "Privacy"], defaultValue: "Controls" },
      { kind: "toggle", prop: "autoplay", label: "Flip by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <CapsuleToggles key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  };
