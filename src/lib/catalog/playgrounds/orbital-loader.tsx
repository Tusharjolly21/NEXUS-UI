"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { OrbitalLoader } from "@/components/orbital-loader";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "OrbitalLoader",
    importPath: "@/components/orbital-loader",
    snippetBaseProps: ['messages={["Uploading your files", "Checking for duplicates", "Making thumbnails"]}', 'doneMessage="All 24 files uploaded"'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Accent", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "size", label: "Size", min: 64, max: 180, step: 4, unit: "px", defaultValue: 112 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <OrbitalLoader
        key={String(v.autoplay)}
        messages={["Uploading your files", "Checking for duplicates", "Making thumbnails"]}
        doneMessage="All 24 files uploaded"
        color={v.color === "#0071e3" ? undefined : (v.color as string)}
        size={v.size as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
