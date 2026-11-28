"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MilestoneTimeline } from "@/components/milestone-timeline";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MilestoneTimeline",
    importPath: "@/components/milestone-timeline",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "heading", label: "Heading", options: ["Roadmap", "Our journey", "What's next"], defaultValue: "Roadmap" },
      // Unset, the current milestone (index 2 in the built-in list) opens first.
      { kind: "range", prop: "defaultOpen", label: "Open first", min: 0, max: 3, step: 1, defaultValue: 2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MilestoneTimeline
        key={`${v.defaultOpen}-${v.autoplay}`}
        className="max-w-[640px]"
        heading={v.heading as string}
        defaultOpen={v.defaultOpen as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
