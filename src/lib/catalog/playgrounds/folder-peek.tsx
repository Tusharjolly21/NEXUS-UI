"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FolderPeek } from "@/components/folder-peek";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "FolderPeek",
    importPath: "@/components/folder-peek",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Folder", options: ["#0071e3", "#34c759", "#ff9f0a", "#ff375f", "#8e8e93"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Brand assets", "Launch kit", "Invoices"], defaultValue: "Brand assets" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <FolderPeek key={String(v.autoplay)} autoplay={v.autoplay as boolean} color={v.color as string} title={v.title as string} />,
  };
