"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MotionLayerScroller } from "@/components/motion-layer-scroller";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MotionLayerScroller",
    importPath: "@/components/motion-layer-scroller",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "direction", label: "Direction", options: ["vertical", "horizontal"], defaultValue: "vertical" },
      { kind: "range", prop: "scrollHeight", label: "Height", min: 260, max: 480, step: 10, unit: "px", defaultValue: 420 },
      { kind: "toggle", prop: "showGrid", label: "Grid", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[560px]">
        <MotionLayerScroller
          key={`${v.direction}-${v.autoplay}`}
          direction={v.direction as "vertical"}
          scrollHeight={v.scrollHeight as number}
          showGrid={v.showGrid as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
