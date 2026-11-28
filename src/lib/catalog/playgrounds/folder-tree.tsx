"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FolderTree } from "@/components/folder-tree";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FolderTree",
    importPath: "@/components/folder-tree",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "name", label: "Root folder", options: ["my-app", "website", "docs"], defaultValue: "my-app" },
      { kind: "toggle", prop: "draggable", label: "Drag into folders", defaultValue: true },
      { kind: "toggle", prop: "editable", label: "New, rename and delete", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <FolderTree key={String(v.autoplay)} name={v.name as string} draggable={v.draggable as boolean} editable={v.editable as boolean} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
