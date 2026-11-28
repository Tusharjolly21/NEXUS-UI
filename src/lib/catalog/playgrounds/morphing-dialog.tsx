"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MorphingDialog } from "@/components/morphing-dialog";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MorphingDialog",
    importPath: "@/components/morphing-dialog",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "projectName", label: "Project", options: ["orbitly-site", "launch-notes", "docs-v2"], defaultValue: "orbitly-site" },
      { kind: "range", prop: "pageCount", label: "Pages", min: 1, max: 60, step: 1, defaultValue: 14 },
      { kind: "select", prop: "shareBase", label: "Share host", options: ["nexus.app/p", "share.example.com", "go.example.dev/s"], defaultValue: "nexus.app/p" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MorphingDialog key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        projectName={v.projectName as string}
        pageCount={v.pageCount as number}
        shareBase={v.shareBase as string}
      />
    ),
  };
