"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ThreeDFolder } from "@/components/three-d-folder";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ThreeDFolder",
    importPath: "@/components/three-d-folder",
    snippetBaseProps: ['title="Launch Assets"'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "folderBackColor", label: "Back", options: ["#3d9cf0", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#3d9cf0" },
      { kind: "color", prop: "folderFrontColor", label: "Front", options: ["#6cb8f6", "#5fd47f", "#ff7a93", "#d48cf7", "#ffbf4d"], defaultValue: "#6cb8f6" },
      { kind: "select", prop: "size", label: "Size", options: ["md", "sm"], defaultValue: "md" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ThreeDFolder
        key={String(v.autoplay)}
        title="Launch Assets"
        folderBackColor={v.folderBackColor as string}
        folderFrontColor={v.folderFrontColor as string}
        size={v.size as "md"}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
