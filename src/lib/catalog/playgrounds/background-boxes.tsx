"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BackgroundBoxes } from "@/components/background-boxes";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    fillStage: true,
    componentName: "BackgroundBoxes",
    importPath: "@/components/background-boxes",
    snippetBaseProps: ['className="h-[600px] w-full"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "boxWidth", label: "Box width", min: 24, max: 120, step: 2, unit: "px", defaultValue: 64 },
      { kind: "range", prop: "boxHeight", label: "Box height", min: 16, max: 80, step: 2, unit: "px", defaultValue: 32 },
      { kind: "range", prop: "skewX", label: "Skew X", min: -60, max: 60, step: 1, unit: "°", defaultValue: -48 },
      { kind: "range", prop: "skewY", label: "Skew Y", min: -30, max: 30, step: 1, unit: "°", defaultValue: 14 },
      { kind: "range", prop: "scale", label: "Scale", min: 0.3, max: 1.2, step: 0.025, unit: "×", defaultValue: 0.675 },
      { kind: "range", prop: "rotation", label: "Rotation", min: -45, max: 45, step: 1, unit: "°", defaultValue: 0 },
      { kind: "color", prop: "borderColor", label: "Lines", options: ["#3a3a3c", "#d2d2d7", "#1e3a8a", "#4c1d95"], defaultValue: "#3a3a3c" },
      { kind: "toggle", prop: "showCrosses", label: "Crosses", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    // Drawn on one canvas, so the full grid stays smooth while sliders move.
    render: (v) => (
      <BackgroundBoxes key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        boxWidth={v.boxWidth as number}
        boxHeight={v.boxHeight as number}
        skewX={v.skewX as number}
        skewY={v.skewY as number}
        scale={v.scale as number}
        rotation={v.rotation as number}
        borderColor={v.borderColor as string}
        crossColor={v.borderColor as string}
        showCrosses={v.showCrosses as boolean}
        className="absolute inset-0 h-full w-full"
      />
    ),
  };
