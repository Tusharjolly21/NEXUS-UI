"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CubesGrid } from "@/components/cubes-grid";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CubesGrid",
    importPath: "@/components/cubes-grid",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "variant", label: "Variant", options: ["isometric", "perspective"], defaultValue: "isometric" },
      { kind: "range", prop: "amplitude", label: "Wave height", min: 0.2, max: 1.6, step: 0.05, defaultValue: 0.7 },
      { kind: "range", prop: "glow", label: "Glow", min: 0, max: 1.5, step: 0.05, defaultValue: 0.6 },
      { kind: "toggle", prop: "idleRipples", label: "Ripple by itself", defaultValue: true },
    ],
    render: (v) => (
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl" style={{ background: v.variant === "perspective" ? "#0b0b0d" : "#f5f5f4" }}>
        <CubesGrid
          key={String(v.variant)}
          variant={v.variant as "isometric" | "perspective"}
          amplitude={v.amplitude as number}
          glow={v.glow as number}
          idleRipples={v.idleRipples as boolean}
        />
      </div>
    ),
  };
