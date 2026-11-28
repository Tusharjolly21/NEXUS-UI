"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ExpandableCards } from "@/components/expandable-cards";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ExpandableCards",
    importPath: "@/components/expandable-cards",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "expandInto", label: "Open into", options: ["grid", "viewport"], defaultValue: "grid" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    // Autoplay only runs in grid mode: in viewport mode each step would open a page-wide dialog and lock scrolling.
    render: (v) => (
      <ExpandableCards
        key={`${v.expandInto}-${v.autoplay}`}
        expandInto={v.expandInto as "grid"}
        autoplay={(v.autoplay as boolean) && v.expandInto === "grid"}
        className="max-w-[580px]"
      />
    ),
  };
