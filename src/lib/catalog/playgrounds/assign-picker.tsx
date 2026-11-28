"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AssignPicker } from "@/components/assign-picker";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AssignPicker",
    importPath: "@/components/assign-picker",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "multiple", label: "Pick several", defaultValue: true },
      { kind: "range", prop: "maxFaces", label: "Faces in the pill", min: 1, max: 5, step: 1, defaultValue: 3 },
      { kind: "range", prop: "faceSize", label: "Face size", min: 22, max: 36, step: 1, unit: "px", defaultValue: 28 },
      { kind: "range", prop: "bounce", label: "Bounce", min: 0.5, max: 2, step: 0.1, defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AssignPicker
        key={String(v.autoplay)}
        autoplay={v.autoplay as boolean}
        multiple={v.multiple as boolean}
        maxFaces={v.maxFaces as number}
        faceSize={v.faceSize as number}
        bounce={v.bounce as number}
      />
    ),
  };
