"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MatrixLoaders } from "@/components/matrix-loaders";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MatrixLoaders",
    importPath: "@/components/matrix-loaders",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Size", min: 40, max: 80, step: 4, unit: "px", defaultValue: 64 },
      { kind: "toggle", prop: "showLabels", label: "Labels", defaultValue: true },
    ],
    render: (v) => <MatrixLoaders size={v.size as number} showLabels={v.showLabels as boolean} />,
  };
