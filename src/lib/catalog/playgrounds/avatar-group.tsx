"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AvatarGroup } from "@/components/avatar-group";
import type { Playground } from "../playground-types";

const DEMO_AVATARS = [
  { fallback: "PS", tooltip: "Priya Sharma", bgColor: "#06b6d4" },
  { fallback: "JK", tooltip: "James Kowalski", bgColor: "#8b5cf6" },
  { fallback: "SC", tooltip: "Sofia Chen", bgColor: "#10b981" },
  { fallback: "MR", tooltip: "Marcus Reid", bgColor: "#f59e0b" },
  { fallback: "AN", tooltip: "Aisha Nkosi", bgColor: "#d946ef" },
  { fallback: "TR", tooltip: "Tomás Reyes", bgColor: "#0ea5e9" },
];

export const playground: Playground = {
    componentName: "AvatarGroup",
    importPath: "@/components/avatar-group",
    snippetBaseProps: ["avatars={avatars}"],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Size", min: 28, max: 64, step: 1, unit: "px", defaultValue: 40 },
      { kind: "range", prop: "overlap", label: "Overlap", min: 0, max: 24, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "hoverScale", label: "Swell", min: 1, max: 1.6, step: 0.05, unit: "×", defaultValue: 1.3 },
      { kind: "range", prop: "max", label: "Max shown", min: 2, max: 6, step: 1, defaultValue: 6 },
      { kind: "select", prop: "hoverAnimation", label: "Hover", options: ["lift", "scale", "rotate", "up", "none"], defaultValue: "lift" },
      { kind: "select", prop: "entranceAnimation", label: "Entrance", options: ["scale", "fade", "flip", "slide", "bounce", "none"], defaultValue: "scale" },
      { kind: "toggle", prop: "showTooltips", label: "Names", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="pt-12">
        <AvatarGroup autoplay={v.autoplay as boolean}
          key={`${v.entranceAnimation}-${v.max}-${String(v.autoplay)}`}
          avatars={DEMO_AVATARS}
          size={v.size as number}
          overlap={v.overlap as number}
          hoverScale={v.hoverScale as number}
          max={v.max as number}
          hoverAnimation={v.hoverAnimation as "lift"}
          entranceAnimation={v.entranceAnimation as "scale"}
          showTooltips={v.showTooltips as boolean}
        />
      </div>
    ),
  };
