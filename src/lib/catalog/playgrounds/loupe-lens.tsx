"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LoupeLens } from "@/components/loupe-lens";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LoupeLens",
    importPath: "@/components/loupe-lens",
    defaultFill: "light",
    snippetBaseProps: ["height={560}"],
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: true },
      { kind: "range", prop: "magnification", label: "Magnification", min: 1, max: 3.2, step: 0.05, defaultValue: 1.65 },
      { kind: "range", prop: "dispersion", label: "Colour split", min: 0, max: 0.12, step: 0.005, defaultValue: 0.035 },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[1040px] overflow-hidden rounded-3xl">
        <LoupeLens
          key={String(v.autoplay)}
          height={560}
          autoplay={v.autoplay as boolean}
          magnification={v.magnification as number}
          dispersion={v.dispersion as number}
        />
      </div>
    ),
  };
