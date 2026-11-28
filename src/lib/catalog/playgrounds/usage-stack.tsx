"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import * as React from "react";
import type { Playground } from "../playground-types";

const UsageStack = React.lazy(() => import("@/components/usage-stack").then((m) => ({ default: m.UsageStack })));

export const playground: Playground = {
    componentName: "UsageStack",
    importPath: "@/components/usage-stack",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultValue", label: "Start at", options: ["50000", "120000", "300000", "600000"], defaultValue: "120000" },
      { kind: "toggle", prop: "autoplay", label: "Step by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <UsageStack key={`${v.defaultValue}-${v.autoplay}`} defaultValue={Number(v.defaultValue)} autoplay={v.autoplay as boolean} />
      </React.Suspense>
    ),
  };
