"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ImageTrail } from "@/components/image-trail";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    fillStage: true,
    componentName: "ImageTrail",
    importPath: "@/components/image-trail",
    snippetBaseProps: ['className="h-96 w-full"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "spacing", label: "Spacing", min: 12, max: 120, step: 2, unit: "px", defaultValue: 48 },
      { kind: "range", prop: "imageSize", label: "Image size", min: 48, max: 200, step: 4, unit: "px", defaultValue: 112 },
      { kind: "range", prop: "duration", label: "Lifetime", min: 200, max: 3000, step: 50, unit: "ms", defaultValue: 1000 },
      { kind: "range", prop: "cornerRadius", label: "Corner", min: 0, max: 60, step: 1, unit: "px", defaultValue: 14 },
      { kind: "range", prop: "fadeOutBlur", label: "Fade blur", min: 0, max: 20, step: 1, unit: "px", defaultValue: 6 },
      { kind: "range", prop: "smoothness", label: "Smoothness", min: 0, max: 1, step: 0.05, defaultValue: 0.7 },
      { kind: "toggle", prop: "magneticEffect", label: "Magnetic", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ImageTrail
        key={String(v.autoplay)}
        spacing={v.spacing as number}
        imageSize={v.imageSize as number}
        duration={v.duration as number}
        cornerRadius={v.cornerRadius as number}
        fadeOutBlur={v.fadeOutBlur as number}
        smoothness={v.smoothness as number}
        magneticEffect={v.magneticEffect as boolean}
        autoplay={v.autoplay as boolean}
        className="absolute inset-0 h-full w-full rounded-none shadow-none"
      />
    ),
  };
