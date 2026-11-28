"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MeshNet } from "@/components/mesh-net";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "MeshNet",
    importPath: "@/components/mesh-net",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "gridSize", label: "Node spacing", min: 36, max: 110, step: 2, defaultValue: 64 },
      { kind: "range", prop: "revealRadius", label: "Reveal radius", min: 100, max: 400, step: 10, defaultValue: 230 },
      { kind: "range", prop: "push", label: "Push", min: 0, max: 70, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black">
        <MeshNet
          key={`${v.gridSize}-${v.autoplay}`}
          gridSize={v.gridSize as number}
          revealRadius={v.revealRadius as number}
          push={v.push as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
