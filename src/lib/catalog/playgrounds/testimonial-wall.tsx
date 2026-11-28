"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TestimonialWall } from "@/components/testimonial-wall";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "TestimonialWall",
    importPath: "@/components/testimonial-wall",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Heading", options: ["Loved by teams who ship", "Trusted by makers", "What people are saying"], defaultValue: "Loved by teams who ship" },
      { kind: "range", prop: "speed", label: "Drift speed", min: 8, max: 90, step: 1, unit: "px/s", defaultValue: 30 },
      { kind: "range", prop: "height", label: "Wall height", min: 360, max: 720, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Drift", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[1040px]">
        <TestimonialWall
          key={String(v.autoplay)}
          title={String(v.title || "Loved by teams who ship")}
          speed={v.speed as number}
          height={v.height as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
