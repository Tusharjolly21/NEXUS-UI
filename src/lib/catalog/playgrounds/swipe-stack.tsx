"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SwipeStack } from "@/components/swipe-stack";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SwipeStack",
    importPath: "@/components/swipe-stack",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "swipeDistance", label: "Swipe distance", min: 40, max: 200, step: 10, unit: "px", defaultValue: 110 },
      { kind: "range", prop: "tilt", label: "Tilt", min: 0, max: 40, step: 2, unit: "deg", defaultValue: 18 },
      { kind: "range", prop: "spacing", label: "Stack spacing", min: 0, max: 28, step: 2, unit: "px", defaultValue: 12 },
      { kind: "range", prop: "bounce", label: "Snap-back bounce", min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
      { kind: "range", prop: "flingSpeed", label: "Throw speed", min: 0.5, max: 2.5, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Swipe by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SwipeStack
        key={String(v.autoplay)}
        swipeDistance={v.swipeDistance as number}
        tilt={v.tilt as number}
        spacing={v.spacing as number}
        bounce={v.bounce as number}
        flingSpeed={v.flingSpeed as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
