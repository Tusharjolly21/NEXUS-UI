"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LiquidPagination } from "@/components/liquid-pagination";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LiquidPagination",
    importPath: "@/components/liquid-pagination",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "variant", label: "Style", options: ["numbers", "dots"], defaultValue: "numbers" },
      { kind: "range", prop: "count", label: "Pages", min: 3, max: 60, step: 1, unit: "", defaultValue: 24 },
      { kind: "range", prop: "siblings", label: "Pages beside the current one", min: 0, max: 3, step: 1, unit: "", defaultValue: 1 },
      { kind: "color", prop: "color", label: "Drop colour", options: ["#1d1d1f", "#0071e3", "#30d158", "#ff9f0a", "#bf5af2"], defaultValue: "#1d1d1f" },
      { kind: "toggle", prop: "autoplay", label: "Turn pages by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[640px] justify-center">
        <LiquidPagination
          key={`${String(v.autoplay)}-${String(v.variant)}-${String(v.count)}`}
          variant={v.variant as "numbers"}
          count={v.variant === "dots" ? Math.min(v.count as number, 12) : (v.count as number)}
          siblings={v.siblings as number}
          color={v.color as string}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
