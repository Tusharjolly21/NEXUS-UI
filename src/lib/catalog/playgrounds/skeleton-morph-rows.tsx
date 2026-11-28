"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SkeletonMorphRows } from "@/components/skeleton-morph-rows";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SkeletonMorphRows",
    importPath: "@/components/skeleton-morph-rows",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[520px]">
        <SkeletonMorphRows key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
