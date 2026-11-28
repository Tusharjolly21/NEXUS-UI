"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { UploadDropzone } from "@/components/upload-dropzone";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "UploadDropzone",
    importPath: "@/components/upload-dropzone",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "multiple", label: "Multiple", defaultValue: true },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Drag a file here", "Drop your files", "Add attachments"], defaultValue: "Drag a file here" },
      { kind: "select", prop: "hint", label: "Hint", options: ["Up to 5 MB", "PNG, JPG or MP4", "Max 10 files"], defaultValue: "Up to 5 MB" },
      { kind: "toggle", prop: "disabled", label: "Disabled", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <UploadDropzone key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        multiple={v.multiple as boolean}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        title={v.title as string}
        hint={v.hint as string}
        disabled={v.disabled as boolean}
        initialFiles={[{ name: "Moodboard.png", size: 1240000, type: "image/png", progress: 1 }]}
      />
    ),
  };
