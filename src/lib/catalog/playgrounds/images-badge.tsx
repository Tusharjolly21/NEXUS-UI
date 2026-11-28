"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ImagesBadge } from "@/components/images-badge";
import type { Playground } from "../playground-types";

const DEMO_BADGE_TEAM = [
  { alt: "Ava Chen" },
  { alt: "Noah Park" },
  { alt: "Mira Shah" },
  { alt: "Leo Grant" },
  { alt: "Zoe Ito" },
  { alt: "Kai Moss" },
  { alt: "Sam Reyes" },
  { alt: "Iris Vale" },
];

export const playground: Playground = {
    componentName: "ImagesBadge",
    importPath: "@/components/images-badge",
    snippetBaseProps: ["images={team}", 'label="Editing now"'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "select", prop: "shape", label: "Shape", options: ["circle", "rounded", "square"], defaultValue: "circle" },
      { kind: "range", prop: "revealCount", label: "Fan out", min: 0, max: 5, step: 1, defaultValue: 2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ImagesBadge
        key={String(v.autoplay)}
        images={DEMO_BADGE_TEAM}
        label="Editing now"
        size={v.size as "md"}
        shape={v.shape as "circle"}
        revealCount={v.revealCount as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
