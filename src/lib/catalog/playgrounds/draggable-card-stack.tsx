"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { DraggableCardStack } from "@/components/draggable-card-stack";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "DraggableCardStack",
    importPath: "@/components/draggable-card-stack",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "maxRotation", label: "Tilt", min: 0, max: 20, step: 1, unit: "°", defaultValue: 9 },
      { kind: "range", prop: "stackOffset", label: "Offset", min: 0, max: 24, step: 1, unit: "px", defaultValue: 0 },
      { kind: "toggle", prop: "showOverlay", label: "Captions", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DraggableCardStack
        key={String(v.autoplay)}
        maxRotation={v.maxRotation as number}
        stackOffset={v.stackOffset as number}
        showOverlay={v.showOverlay as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
