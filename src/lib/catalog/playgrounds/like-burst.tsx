"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LikeBurst } from "@/components/like-burst";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "LikeBurst",
    importPath: "@/components/like-burst",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Color", options: ["#ff3b5c", "#ff7a1a", "#0071e3", "#10b981", "#17181a"], defaultValue: "#ff3b5c" },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "range", prop: "burst", label: "Burst", min: 0, max: 20, step: 1, defaultValue: 10 },
      { kind: "range", prop: "defaultCount", label: "Count", min: 0, max: 99999, step: 1, defaultValue: 1299 },
      { kind: "toggle", prop: "defaultLiked", label: "Start liked", defaultValue: false },
    ],
    render: (v) => (
      <LikeBurst
        key={`${v.defaultCount}-${v.defaultLiked}`}
        color={v.color as string}
        size={v.size as "md"}
        burst={v.burst as number}
        defaultCount={v.defaultCount as number}
        defaultLiked={v.defaultLiked as boolean}
      />
    ),
  };
