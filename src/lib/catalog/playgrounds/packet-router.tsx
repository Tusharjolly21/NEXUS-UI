"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PacketRouter, type RouterStrategy } from "@/components/packet-router";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PacketRouter",
    importPath: "@/components/packet-router",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultStrategy", label: "Start on", options: ["Cost", "Balanced", "Quality"], defaultValue: "Balanced" },
      { kind: "toggle", prop: "autoplay", label: "Cycle strategies", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PacketRouter
        key={`${v.defaultStrategy}-${v.autoplay}`}
        defaultStrategy={v.defaultStrategy as RouterStrategy}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
