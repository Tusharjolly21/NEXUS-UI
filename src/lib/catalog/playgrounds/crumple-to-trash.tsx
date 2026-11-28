"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CrumpleToTrash } from "@/components/crumple-to-trash";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CrumpleToTrash",
    importPath: "@/components/crumple-to-trash",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Page title", options: ["Draft · Q4 notes", "Launch checklist", "Old invoice"], defaultValue: "Draft · Q4 notes" },
      { kind: "toggle", prop: "autoplay", label: "Toss by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <CrumpleToTrash key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  };
