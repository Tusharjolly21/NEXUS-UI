"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { KpiStrip } from "@/components/pulse-dashboard-kpis";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "KpiStrip",
    importPath: "@/components/pulse-dashboard-kpis",
    defaultFill: "light",
    controls: [
      // Unset, the first built-in period ("7d") is selected.
      { kind: "select", prop: "defaultPeriod", label: "Period", options: ["7d", "30d", "90d"], defaultValue: "7d" },
      { kind: "select", prop: "title", label: "Title", options: ["This week at a glance", "Growth pulse", "Key metrics"], defaultValue: "This week at a glance" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <KpiStrip
        key={`${v.defaultPeriod}-${v.autoplay}`}
        className="max-w-[900px]"
        defaultPeriod={v.defaultPeriod as string}
        title={v.title as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
