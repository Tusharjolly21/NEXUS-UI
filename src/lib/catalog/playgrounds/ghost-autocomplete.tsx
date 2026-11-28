"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GhostAutocomplete } from "@/components/ghost-autocomplete";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GhostAutocomplete",
    importPath: "@/components/ghost-autocomplete",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "to", label: "Recipient", options: ["leo@fieldnotes.example", "nina@fieldnotes.example", "team@fieldnotes.example"], defaultValue: "leo@fieldnotes.example" },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 480 },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GhostAutocomplete key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        to={v.to as string}
        width={v.width as number}
      />
    ),
  };
