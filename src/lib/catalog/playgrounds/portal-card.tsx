"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PortalCard } from "@/components/portal-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PortalCard",
    importPath: "@/components/portal-card",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "height", label: "Height", min: 320, max: 560, step: 10, unit: "px", defaultValue: 460 },
      { kind: "toggle", prop: "autoplay", label: "Ghost hand", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full">
        <PortalCard height={v.height as number} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
