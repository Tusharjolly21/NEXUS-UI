"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GooeyInput } from "@/components/gooey-input";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GooeyInput",
    importPath: "@/components/gooey-input",
    snippetBaseProps: ['placeholder="Search catalog"', "suggestions={pages}"],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "collapsedWidth", label: "Collapsed", min: 90, max: 200, step: 5, unit: "px", defaultValue: 115 },
      { kind: "range", prop: "expandedWidth", label: "Expanded", min: 160, max: 300, step: 5, unit: "px", defaultValue: 200 },
      { kind: "range", prop: "expandedOffset", label: "Offset", min: 48, max: 120, step: 2, unit: "px", defaultValue: 56 },
      { kind: "range", prop: "gooeyBlur", label: "Goo", min: 0, max: 12, step: 0.5, unit: "px", defaultValue: 5 },
    ],
    render: (v) => (
      <GooeyInput
        placeholder="Search catalog"
        suggestions={["Motion kit", "Motion values", "Spring motion", "Layout animation", "Scroll reveal", "Gooey filter"]}
        collapsedWidth={v.collapsedWidth as number}
        expandedWidth={v.expandedWidth as number}
        expandedOffset={v.expandedOffset as number}
        gooeyBlur={v.gooeyBlur as number}
      />
    ),
  };
