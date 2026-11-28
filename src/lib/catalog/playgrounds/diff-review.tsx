"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DiffReview } from "@/components/diff-review";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "DiffReview",
    importPath: "@/components/diff-review",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Label", options: ["Homepage · Hero copy", "Pricing · Plan blurb", "Docs · Intro"], defaultValue: "Homepage · Hero copy" },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DiffReview key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        title={v.title as string}
        width={v.width as number}
      />
    ),
  };
