"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LiquidSmoke } from "@/components/liquid-smoke";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    fillStage: true,
    componentName: "LiquidSmoke",
    importPath: "@/components/liquid-smoke",
    defaultFill: "dark",
    blurb: "Move over the stage to stir it. Multiply turns the stage light and draws in ink.",
    controls: [
      { kind: "color", prop: "color", label: "Colour", options: ["#e9e9ee", "#7fd0ff", "#b6a4ff", "#ff8fb1", "#7ff0c0", "#1d1d1f"], defaultValue: "#e9e9ee" },
      { kind: "toggle", prop: "rainbow", label: "Rainbow", defaultValue: false },
      { kind: "select", prop: "blend", label: "Blend", options: ["screen", "normal", "multiply", "difference"], defaultValue: "screen" },
      { kind: "select", prop: "cursor", label: "Cursor", options: ["ring", "dot", "native"], defaultValue: "ring" },
      { kind: "range", prop: "fade", label: "Fade", min: 0.3, max: 6, step: 0.1, defaultValue: 2.4 },
      { kind: "range", prop: "force", label: "Force", min: 1000, max: 12000, step: 250, defaultValue: 6000 },
      { kind: "range", prop: "radius", label: "Radius", min: 0.05, max: 0.8, step: 0.01, defaultValue: 0.25 },
      { kind: "range", prop: "swirl", label: "Swirl", min: 0, max: 50, step: 1, defaultValue: 14 },
      { kind: "range", prop: "gloss", label: "Gloss", min: 0, max: 1, step: 0.05, defaultValue: 0.5 },
      { kind: "toggle", prop: "shading", label: "Shading", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Stir by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => {
      const ink = v.blend === "multiply";
      return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: ink ? "#f5f4f0" : "#0b0b0d" }}>
          {/* a fresh fluid when switching between ink and light smoke, so silver never lingers as a grey wash */}
          <LiquidSmoke
            key={ink ? "ink" : "smoke"}
            color={ink && v.color === "#e9e9ee" ? undefined : (v.color as string)}
            rainbow={v.rainbow as boolean}
            blend={v.blend as "screen" | "normal" | "multiply" | "difference"}
            cursor={v.cursor as "ring" | "dot" | "native"}
            fade={v.fade as number}
            force={v.force as number}
            radius={v.radius as number}
            swirl={v.swirl as number}
            gloss={v.gloss as number}
            shading={v.shading as boolean}
            autoplay={v.autoplay as boolean}
          />
        </div>
      );
    },
  };
