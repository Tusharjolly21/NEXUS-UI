"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DepthTestimonials } from "@/components/depth-testimonials";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "DepthTestimonials",
    importPath: "@/components/depth-testimonials",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "heading", label: "Heading", options: ["Loved by people who ship", "Wall of love", "What teams say"], defaultValue: "Loved by people who ship" },
      { kind: "select", prop: "eyebrow", label: "Eyebrow", options: ["Testimonials", "Reviews", "Customers"], defaultValue: "Testimonials" },
      { kind: "range", prop: "interval", label: "Auto-advance", min: 0, max: 6000, step: 500, unit: "ms", defaultValue: 0 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DepthTestimonials
        key={String(v.autoplay)}
        heading={v.heading as string}
        eyebrow={v.eyebrow as string}
        interval={v.interval as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
