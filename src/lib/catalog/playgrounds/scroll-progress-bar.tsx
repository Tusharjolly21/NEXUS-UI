"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ScrollProgressBar",
    importPath: "@/components/scroll-progress-bar",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "fillColor", label: "Fill", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "orientation", label: "Orientation", options: ["vertical", "horizontal"], defaultValue: "vertical" },
      { kind: "range", prop: "markerCount", label: "Milestones", min: 2, max: 8, step: 1, defaultValue: 4 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className={v.orientation === "horizontal" ? "w-full max-w-[420px]" : undefined}>
        <ScrollProgressBar
          key={String(v.autoplay)}
          fillColor={v.fillColor === "#0071e3" ? undefined : (v.fillColor as string)}
          orientation={v.orientation as "vertical"}
          markerCount={v.markerCount as number}
          autoplay={v.autoplay as boolean}
          ariaLabel="Article progress"
        />
      </div>
    ),
  };
