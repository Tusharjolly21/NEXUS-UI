"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MercuryTabs } from "@/components/mercury-tabs";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "MercuryTabs",
    importPath: "@/components/mercury-tabs",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultTab", label: "Starting tab", options: ["overview", "insights", "layers", "wallet"], defaultValue: "overview" },
      { kind: "toggle", prop: "autoplay", label: "Tour the tabs by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[720px] justify-center">
        <MercuryTabs key={`${String(v.autoplay)}-${String(v.defaultTab)}`} defaultTab={v.defaultTab as string} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
